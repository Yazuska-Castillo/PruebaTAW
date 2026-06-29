import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PrestamoEntity } from '../database/entities/prestamo.entity';
import { ReservaEntity } from '../database/entities/reserva.entity';

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(PrestamoEntity)
    private readonly prestamoRepository: Repository<PrestamoEntity>,

    @InjectRepository(ReservaEntity)
    private readonly reservaRepository: Repository<ReservaEntity>,
  ) {}

  async obtenerMiHistorial(idUsuario: number) {
    const [prestamos, reservas] = await Promise.all([
      this.obtenerMisPrestamos(idUsuario),
      this.obtenerMisReservas(idUsuario),
    ]);

    return {
      prestamos,
      reservas,
    };
  }

  async obtenerMisPrestamos(idUsuario: number) {
    return this.prestamoRepository.find({
      where: {
        usuario: { idUsuario },
      },
      relations: {
        libro: true,
      },
      order: {
        fechaPrestamo: 'DESC',
      },
    });
  }

  async obtenerMisReservas(idUsuario: number) {
    return this.reservaRepository.find({
      where: {
        idUsuario: idUsuario as any,
      },
      order: {
        fechaReserva: 'DESC',
      },
    });
  }
}
