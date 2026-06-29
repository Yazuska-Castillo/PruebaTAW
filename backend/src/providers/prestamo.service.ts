import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  PrestamoEntity,
  EstadoPrestamo,
} from '../database/entities/prestamo.entity';
import { EstadoLibro, LibroEntity } from '../database/entities/libro.entity';
import { LibraryAccessService } from './library-access.service';

@Injectable()
export class PrestamoService {
  constructor(
    @InjectRepository(PrestamoEntity)
    private readonly prestamoRepository: Repository<PrestamoEntity>,
    private readonly libraryAccessService: LibraryAccessService,
  ) {}

  async solicitarPrestamo(
    userId: number,
    idLibro: number,
  ): Promise<PrestamoEntity> {
    // Validar que el usuario esté activo y sin multas
    const usuario =
      await this.libraryAccessService.validateNoPendingFines(userId);

    return this.prestamoRepository.manager.transaction(async (manager) => {
      const libroRepository = manager.getRepository(LibroEntity);
      const prestamoRepository = manager.getRepository(PrestamoEntity);

      // Verificar que el libro existe y está disponible según el modelo actual
      const libro = await libroRepository.findOne({
        where: { idLibro },
        lock: { mode: 'pessimistic_write' },
      });

      if (!libro) {
        throw new NotFoundException('Libro no encontrado');
      }

      const libroDisponible =
        libro.estado === EstadoLibro.DISPONIBLE && libro.stockDisponible > 0;

      if (!libroDisponible) {
        throw new ForbiddenException(
          'El libro no está disponible para préstamo',
        );
      }

      // Verificar que el usuario no tenga préstamos pendientes del mismo libro
      const prestamoPendiente = await prestamoRepository.findOne({
        where: {
          usuario: { idUsuario: userId },
          libro: { idLibro },
          estado: In([EstadoPrestamo.ACTIVO, EstadoPrestamo.VENCIDO]),
        },
      });

      if (prestamoPendiente) {
        throw new ForbiddenException(
          'Ya tienes un préstamo pendiente de este libro',
        );
      }

      // Crear el préstamo
      const fechaPrestamo = new Date();
      const fechaDevolucionEsperada = new Date();
      fechaDevolucionEsperada.setDate(fechaPrestamo.getDate() + 14); // 14 días por defecto

      const prestamo = prestamoRepository.create({
        usuario,
        libro,
        fechaPrestamo,
        fechaDevolucionEsperada,
        estado: EstadoPrestamo.ACTIVO,
      });

      libro.stockDisponible -= 1;
      libro.estado =
        libro.stockDisponible > 0
          ? EstadoLibro.DISPONIBLE
          : EstadoLibro.PRESTADO;
      libro.disponible = libro.estado === EstadoLibro.DISPONIBLE;

      await libroRepository.save(libro);

      return prestamoRepository.save(prestamo);
    });
  }

  async devolverPrestamo(
    userId: number,
    idPrestamo: number,
  ): Promise<PrestamoEntity> {
    return this.prestamoRepository.manager.transaction(async (manager) => {
      const libroRepository = manager.getRepository(LibroEntity);
      const prestamoRepository = manager.getRepository(PrestamoEntity);

      const prestamo = await prestamoRepository.findOne({
        where: {
          idPrestamo,
          usuario: { idUsuario: userId },
          estado: In([EstadoPrestamo.ACTIVO, EstadoPrestamo.VENCIDO]),
        },
        relations: {
          libro: true,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!prestamo) {
        throw new NotFoundException('Prestamo activo no encontrado');
      }

      const libro = await libroRepository.findOne({
        where: { idLibro: prestamo.libro.idLibro },
        lock: { mode: 'pessimistic_write' },
      });

      if (!libro) {
        throw new NotFoundException('Libro no encontrado');
      }

      prestamo.estado = EstadoPrestamo.DEVUELTO;
      prestamo.fechaDevolucionReal = new Date();

      libro.stockDisponible = Math.min(
        libro.stockDisponible + 1,
        libro.stockTotal,
      );
      libro.estado =
        libro.stockDisponible > 0
          ? EstadoLibro.DISPONIBLE
          : EstadoLibro.PRESTADO;
      libro.disponible = libro.estado === EstadoLibro.DISPONIBLE;

      await libroRepository.save(libro);

      return prestamoRepository.save(prestamo);
    });
  }
}
