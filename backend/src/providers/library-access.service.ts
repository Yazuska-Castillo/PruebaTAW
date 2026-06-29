import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LibroEntity } from '../database/entities/libro.entity';
import { PrestamoEntity } from '../database/entities/prestamo.entity';
import { EstadoPagoMulta } from '../database/entities/multa.entity';
import {
  EstadoReserva,
  ReservaEntity,
} from '../database/entities/reserva.entity';
import { UsuarioEntity } from '../database/entities/usuario.entity';

interface SearchBooksParams {
  q?: string;
  titulo?: string;
  autor?: string;
  categoria?: string;
  disponible?: string;
  page?: string;
  limit?: string;
}

@Injectable()
export class LibraryAccessService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    @InjectRepository(LibroEntity)
    private readonly libroRepository: Repository<LibroEntity>,
    @InjectRepository(ReservaEntity)
    private readonly reservaRepository: Repository<ReservaEntity>,
  ) {}

  async validateAcademicStatus(userId: number): Promise<UsuarioEntity> {
    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario: userId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.estadoAcademico !== 'activo') {
      throw new ForbiddenException(
        'El estudiante no tiene estado académico activo',
      );
    }

    return usuario;
  }

  async validateNoPendingFines(userId: number): Promise<UsuarioEntity> {
    const usuario = await this.validateAcademicStatus(userId);

    const multasPendientes = await this.usuarioRepository.manager
      .getRepository(PrestamoEntity)
      .count({
        where: {
          usuario: { idUsuario: userId },
          multa: { estadoPago: EstadoPagoMulta.PENDIENTE },
        },
        relations: ['multa'],
      });

    const tieneMulta = multasPendientes > 0;
    if (usuario.tieneMultaImpaga !== tieneMulta) {
      await this.usuarioRepository.update(
        { idUsuario: userId },
        { tieneMultaImpaga: tieneMulta },
      );
      usuario.tieneMultaImpaga = tieneMulta;
    }

    if (tieneMulta) {
      throw new ForbiddenException('El usuario tiene multas impagas');
    }

    return usuario;
  }

  async searchBooks(params: SearchBooksParams) {
    const pageParam = Number(params.page);
    const limitParam = Number(params.limit);
    const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isInteger(limitParam) && limitParam > 0
        ? Math.min(limitParam, 50)
        : 10;

    const query = this.libroRepository
      .createQueryBuilder('libro')
      .orderBy('libro.titulo', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const search = params.q?.trim();
    if (search) {
      query.andWhere(
        '(LOWER(libro.titulo) LIKE LOWER(:search) OR LOWER(libro.autor) LIKE LOWER(:search) OR LOWER(libro.categoria) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (params.titulo?.trim()) {
      query.andWhere('LOWER(libro.titulo) LIKE LOWER(:titulo)', {
        titulo: `%${params.titulo.trim()}%`,
      });
    }

    if (params.autor?.trim()) {
      query.andWhere('LOWER(libro.autor) LIKE LOWER(:autor)', {
        autor: `%${params.autor.trim()}%`,
      });
    }

    if (params.categoria?.trim()) {
      query.andWhere('LOWER(libro.categoria) LIKE LOWER(:categoria)', {
        categoria: `%${params.categoria.trim()}%`,
      });
    }

    if (params.disponible === 'true' || params.disponible === 'false') {
      query.andWhere('libro.disponible = :disponible', {
        disponible: params.disponible === 'true',
      });
    }

    const [libros, total] = await query.getManyAndCount();

    return {
      libros,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBookDetail(idLibro: number): Promise<LibroEntity> {
    const libro = await this.libroRepository.findOne({
      where: { idLibro },
    });

    if (!libro) {
      throw new NotFoundException('Libro no encontrado');
    }

    return libro;
  }

  async cancelReservation(
    userId: number,
    idReserva: number,
    motivoCancelacion?: string,
  ): Promise<ReservaEntity> {
    return this.reservaRepository.manager.transaction(async (manager) => {
      const reservaRepository = manager.getRepository(ReservaEntity);
      const reserva = await reservaRepository.findOne({
        where: {
          idReserva,
          idUsuario: { idUsuario: userId },
          estado: EstadoReserva.ACTIVA,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!reserva) {
        throw new NotFoundException('Reserva activa no encontrada');
      }

      reserva.estado = EstadoReserva.CANCELADA;
      reserva.motivoCancelacion = motivoCancelacion?.trim().slice(0, 255);

      return reservaRepository.save(reserva);
    });
  }
}
