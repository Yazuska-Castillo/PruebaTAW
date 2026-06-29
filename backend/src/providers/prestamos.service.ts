import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Repository } from 'typeorm';

import { PrestamoEntity } from '../database/entities/prestamo.entity';
import { LibroEntity } from '../database/entities/libro.entity';

const ESTADO_PRESTAMO = {
  ENTREGADO: 1,
  FINALIZADO: 2,
  ATRASADO: 3,
};

@Injectable()
export class PrestamosService {
  constructor(
    @InjectRepository(PrestamoEntity)
    private readonly prestamoRepository: Repository<PrestamoEntity>,

    @InjectRepository(LibroEntity)
    private readonly libroRepository: Repository<LibroEntity>,
  ) {}

  async findAll() {
    return this.prestamoRepository.find({
      relations: {
        usuario: true,
        libro: true,
      },
      order: {
        idPrestamo: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const prestamo = await this.prestamoRepository.findOne({
      where: { idPrestamo: id },
      relations: {
        usuario: true,
        libro: true,
      },
    });

    if (!prestamo) {
      throw new NotFoundException('Préstamo no encontrado');
    }

    return prestamo;
  }

  async marcarComoEntregado(id: number) {
    const prestamo = await this.findOne(id);

    if (prestamo.estado === ESTADO_PRESTAMO.FINALIZADO) {
      throw new BadRequestException(
        'No se puede entregar un préstamo ya finalizado',
      );
    }

    prestamo.estado = ESTADO_PRESTAMO.ENTREGADO;

    if (!prestamo.fechaPrestamo) {
      prestamo.fechaPrestamo = new Date();
    }

    return this.prestamoRepository.save(prestamo);
  }

  async finalizarPrestamo(id: number) {
    const prestamo = await this.findOne(id);

    if (prestamo.estado === ESTADO_PRESTAMO.FINALIZADO) {
      throw new BadRequestException('Este préstamo ya fue finalizado');
    }

    prestamo.estado = ESTADO_PRESTAMO.FINALIZADO;
    prestamo.fechaDevolucionReal = new Date();

    const libro = await this.libroRepository.findOne({
      where: { idLibro: prestamo.libro.idLibro },
    });

    if (libro) {
      if (libro.stockDisponible < libro.stockTotal) {
        libro.stockDisponible += 1;
      }

      libro.disponible = libro.estado === 1 && libro.stockDisponible > 0;

      await this.libroRepository.save(libro);
    }

    return this.prestamoRepository.save(prestamo);
  }

  async marcarAtrasados() {
    const prestamos = await this.prestamoRepository.find({
      where: {
        fechaDevolucionEsperada: LessThan(new Date()),
        fechaDevolucionReal: IsNull(),
      },
    });

    for (const prestamo of prestamos) {
      prestamo.estado = ESTADO_PRESTAMO.ATRASADO;
    }

    return this.prestamoRepository.save(prestamos);
  }

  async listarAtrasados() {
    return this.prestamoRepository.find({
      where: {
        estado: ESTADO_PRESTAMO.ATRASADO,
      },
      relations: {
        usuario: true,
        libro: true,
      },
      order: {
        fechaDevolucionEsperada: 'ASC',
      },
    });
  }

  async obtenerFechas(id: number) {
    const prestamo = await this.findOne(id);

    return {
      idPrestamo: prestamo.idPrestamo,
      estado: prestamo.estado,
      fechaPrestamo: prestamo.fechaPrestamo,
      fechaDevolucionEsperada: prestamo.fechaDevolucionEsperada,
      fechaDevolucionReal: prestamo.fechaDevolucionReal,
    };
  }
}
