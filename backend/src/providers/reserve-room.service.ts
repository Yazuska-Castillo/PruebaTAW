/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ReservaEntity,
  EstadoReserva,
} from '../database/entities/reserva.entity';
import {
  SalaEntity,
  EstadoSala,
  UbicacionSala,
} from '../database/entities/sala.entity';
import { UsuarioEntity } from '../database/entities/usuario.entity';
import { ReserveCreateDto } from '../dto/reserve-create.dto';
import { ReserveResponseDto } from '../dto/reserve-response.dto';
import { LibraryAccessService } from './library-access.service';
import { BloqueHorario } from '../database/entities/reserva.entity';

@Injectable()
export class ReserveRoomService {
  constructor(
    @InjectRepository(ReservaEntity)
    private readonly reservaRepository: Repository<ReservaEntity>,

    @InjectRepository(SalaEntity)
    private readonly salaRepository: Repository<SalaEntity>,

    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,

    private readonly libraryAccessService: LibraryAccessService,
  ) {}

  // crear reserva
  async create(
    dto: ReserveCreateDto,
    usuarioId: number,
  ): Promise<ReserveResponseDto> {
    // validar si la sala existe
    const sala = await this.salaRepository.findOne({
      where: { idSala: dto.idSala },
    });

    // mensaje si no hay sala HTTP 404 (Not Found)
    if (!sala) {
      throw new NotFoundException(`La sala con ID ${dto.idSala} no existe`);
    }

    // validar estado de la sala = DISPONIBLE
    if (sala.estado !== EstadoSala.DISPONIBLE) {
      // mensaje si no esta disponible HTTP 403 (Forbidden)
      throw new ForbiddenException(
        `La sala no está disponible actualmente. Estado: ${sala.estado}`,
      );
    }

    // validar si el usuario existe
    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario: usuarioId },
    });

    // mensaje si no hay usuario HTTP 404 (Not Found)
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // validar que no se puede reservar en fecha pasada
    // new Date(): obtiene la fecha y hora actual
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaReservaDate = new Date(dto.fechaReserva);

    // si fecha reserva < hoy lanza error HTTP 400 (Bad Request) problemas lado cliente
    if (fechaReservaDate < hoy) {
      throw new BadRequestException(
        `No se puede reservar en fechas pasadas. Fecha solicitada: ${dto.fechaReserva}`,
      );
    }

    // validar no choque de horario
    // diccionario bloques de horarios
    const bloqueHorarios: Record<string, { inicio: string; fin: string }> = {
      A: { inicio: '08:00:00', fin: '09:00:00' },
      B: { inicio: '09:00:00', fin: '10:00:00' },
      C: { inicio: '10:00:00', fin: '11:00:00' },
      D: { inicio: '11:00:00', fin: '12:00:00' },
      E: { inicio: '12:00:00', fin: '13:00:00' },
      F: { inicio: '13:00:00', fin: '14:00:00' },
      G: { inicio: '14:00:00', fin: '15:00:00' },
      H: { inicio: '15:00:00', fin: '16:00:00' },
      I: { inicio: '16:00:00', fin: '17:00:00' },
      J: { inicio: '17:00:00', fin: '18:00:00' },
      K: { inicio: '18:00:00', fin: '19:00:00' },
    };

    // bloque que envio el dto del frontend
    const nuevoRango = bloqueHorarios[dto.bloqueHorario];

    if (!nuevoRango) {
      throw new BadRequestException(
        `El bloque horario ${dto.bloqueHorario} no es válido. Debe ser de la A a la K`,
      );
    }

    // buscar reservas existentes en la misma sala, fecha y activas
    const reservasExistentes = await this.reservaRepository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.idSala', 'sala')
      .where('reserva.idSala = :salaId', { salaId: dto.idSala })
      .andWhere('reserva.fechaReserva = :fecha', { fecha: dto.fechaReserva })
      .andWhere('reserva.estado = :estado', { estado: EstadoReserva.ACTIVA })
      .getMany();

    // ve todas las reservas existentes y compara horarios.
    for (const reservaExistente of reservasExistentes) {
      const rangoExistente = bloqueHorarios[reservaExistente.bloqueHorario];

      if (
        rangoExistente.inicio < nuevoRango.fin &&
        rangoExistente.fin > nuevoRango.inicio
      ) {
        // suelta error si hay choque de horario en reserva
        throw new ForbiddenException(
          `La sala ya está reservada en el bloque ${reservaExistente.bloqueHorario} (${rangoExistente.inicio} - ${rangoExistente.fin})`,
        );
      }
    }

    // validar estado academico
    await this.libraryAccessService.validateAcademicStatus(usuarioId);

    // validar no multa
    await this.libraryAccessService.validateNoPendingFines(usuarioId);

    // crear la reserva para BD
    const nuevaReserva = this.reservaRepository.create({
      idSala: { idSala: dto.idSala },
      idUsuario: { idUsuario: usuarioId },
      fechaReserva: dto.fechaReserva,
      bloqueHorario: dto.bloqueHorario as BloqueHorario,
      estado: EstadoReserva.ACTIVA,
    });

    const reservaGuardada = await this.reservaRepository.save(nuevaReserva);

    // devolver la respuesta al frontend
    return {
      idReserva: reservaGuardada.idReserva,
      idSala: dto.idSala,
      fechaReserva: dto.fechaReserva,
      bloqueHorario: reservaGuardada.bloqueHorario,
      estado: reservaGuardada.estado,
      motivoCancelacion: reservaGuardada.motivoCancelacion,
    };
  }

  // busca todas las reservas de un usuario
  async findEntitiesByUser(usuarioId: number): Promise<ReservaEntity[]> {
    return this.reservaRepository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.idSala', 'sala')
      .leftJoinAndSelect('reserva.idUsuario', 'usuario')
      .where('reserva.id_usuario = :usuarioId', { usuarioId })
      .getMany();
  }

  // filtra todas las reservas de un usuario, solo los datos necesarios
  async findByUser(usuarioId: number): Promise<ReserveResponseDto[]> {
    const reservas = await this.findEntitiesByUser(usuarioId);

    return reservas.map((reserva) => ({
      idReserva: reserva.idReserva,
      idSala: reserva.idSala.idSala,
      fechaReserva: reserva.fechaReserva as unknown as string,
      bloqueHorario: reserva.bloqueHorario,
      estado: reserva.estado,
      motivoCancelacion: reserva.motivoCancelacion,
    }));
  }

  //  busca una reserva por su ID
  async findEntityById(id: number): Promise<ReservaEntity | null> {
    return this.reservaRepository.findOne({
      where: { idReserva: id },
      relations: ['idUsuario', 'idSala'],
    });
  }

  // filtra una reserva específica por su ID, solo los datos necesarios
  async findById(id: number): Promise<ReserveResponseDto | null> {
    const reserva = await this.findEntityById(id);
    if (!reserva) return null;

    return {
      idReserva: reserva.idReserva,
      idSala: reserva.idSala.idSala,
      fechaReserva: reserva.fechaReserva as unknown as string,
      bloqueHorario: reserva.bloqueHorario,
      estado: reserva.estado,
      motivoCancelacion: reserva.motivoCancelacion,
    };
  }

  // cancelar reserva
  async cancel(
    id: number,
    usuarioId: number,
    motivoCancelacion?: string,
  ): Promise<{ message: string; idReserva: number }> {
    // Busca una reserva cuyo idReserva coincida
    const reserva = await this.reservaRepository.findOne({
      where: { idReserva: id },
      relations: ['idSala', 'idUsuario'],
    });

    // mensaje si no hay reserva HTTP 404 (Not Found)
    if (!reserva) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    // valida que el usuario es el dueño de la reserva HTTP 403 (Forbidden)
    if (reserva.idUsuario.idUsuario !== usuarioId) {
      throw new ForbiddenException(
        'No puedes cancelar reservas de otro usuario',
      );
    }

    // valida que la reserva no esté ya cancelada HTTP 400
    if (reserva.estado === EstadoReserva.CANCELADA) {
      throw new BadRequestException('Esta reserva ya está cancelada');
    }

    // valida que no se cancele una reserva de fecha pasada
    // new Date(): obtiene la fecha y hora actual
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaReserva = new Date(reserva.fechaReserva);

    if (fechaReserva < hoy) {
      throw new BadRequestException(
        'No se puede cancelar una reserva de una fecha pasada',
      );
    }

    // cancela la reserva
    reserva.estado = EstadoReserva.CANCELADA;
    reserva.motivoCancelacion = motivoCancelacion;
    await this.reservaRepository.save(reserva);

    return { message: 'Reserva cancelada exitosamente', idReserva: id };
  }

  // tener los bloques mas frecuentes (para el grupo de comida, creo)
  async getMostFrequentBlock(): Promise<string> {
    // obtener salas Cafetería A y Cafetería B, porque son pal grupo de comida
    const salasCafeteria = await this.salaRepository.find({
      where: [
        { ubicacion: UbicacionSala.CAFETERIA_A },
        { ubicacion: UbicacionSala.CAFETERIA_B },
      ],
    });

    // extrae IDs de las salas tipo cafeterias
    const idsSalasCafeteria = salasCafeteria.map((sala) => sala.idSala);

    if (idsSalasCafeteria.length === 0) {
      return 'No hay salas de cafetería registradas';
    }

    // obtener reservas activas o finalizadas
    console.log('idsSalasCafeteria:', idsSalasCafeteria);
    const reservas = await this.reservaRepository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.idSala', 'sala')
      .where('reserva.idSala IN (:...idsSalas)', {
        idsSalas: idsSalasCafeteria,
      })
      .andWhere('reserva.estado IN (:...estados)', {
        estados: [EstadoReserva.ACTIVA, EstadoReserva.FINALIZADA],
      })
      .getMany();

    if (reservas.length === 0) {
      return 'No hay reservas en las salas de cafetería';
    }

    // frecuencia de cada bloque (A-K)
    const contador: Record<string, number> = {};
    const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

    for (const letra of letras) {
      contador[letra] = 0;
    }

    for (const reserva of reservas) {
      const bloque = reserva.bloqueHorario;
      if (contador[bloque] !== undefined) {
        contador[bloque]++;
      }
    }

    // la máxima frecuencia
    let maxFrecuencia = 0;
    for (const letra of letras) {
      if (contador[letra] > maxFrecuencia) {
        maxFrecuencia = contador[letra];
      }
    }

    if (maxFrecuencia === 0) {
      return 'No hay suficientes datos para determinar el bloque más frecuente';
    }

    // bloque con máxima frecuencia
    const bloquesMasFrecuentes: string[] = [];
    for (const letra of letras) {
      if (contador[letra] === maxFrecuencia) {
        bloquesMasFrecuentes.push(letra);
      }
    }

    // mensaje
    const rangosHorarios = {
      A: { inicio: '08:00', fin: '09:00' },
      B: { inicio: '09:00', fin: '10:00' },
      C: { inicio: '10:00', fin: '11:00' },
      D: { inicio: '11:00', fin: '12:00' },
      E: { inicio: '12:00', fin: '13:00' },
      F: { inicio: '13:00', fin: '14:00' },
      G: { inicio: '14:00', fin: '15:00' },
      H: { inicio: '15:00', fin: '16:00' },
      I: { inicio: '16:00', fin: '17:00' },
      J: { inicio: '17:00', fin: '18:00' },
      K: { inicio: '18:00', fin: '19:00' },
    };

    if (bloquesMasFrecuentes.length === 1) {
      const bloque = bloquesMasFrecuentes[0];
      const rango = rangosHorarios[bloque];
      return `El bloque ${bloque} (${rango.inicio} - ${rango.fin}) es el más frecuente`;
    } else {
      const mensajeBloques = bloquesMasFrecuentes
        .map((bloque) => {
          const rango = rangosHorarios[bloque];
          return `${bloque} (${rango.inicio} - ${rango.fin})`;
        })
        .join(' y ');
      return `Los bloques ${mensajeBloques} son los más frecuentes`;
    }
  }

  // Devuelve todas las salas registradas
  async getAllSalas(): Promise<SalaEntity[]> {
    return this.salaRepository.find();
  }

  // Devuelve una sala por su ID
  async getSalaById(idSala: number): Promise<SalaEntity | null> {
    return this.salaRepository.findOne({ where: { idSala } });
  }
}
