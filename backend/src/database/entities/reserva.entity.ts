import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from './usuario.entity';
import { SalaEntity } from './sala.entity';

export enum EstadoReserva {
  ACTIVA = 'Activa',
  CANCELADA = 'Cancelada',
  FINALIZADA = 'Finalizada',
}

export enum BloqueHorario {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  I = 'I',
  J = 'J',
  K = 'K',
}
@Entity('reservas')
export class ReservaEntity {
  @PrimaryGeneratedColumn({ name: 'id_reserva' })
  idReserva!: number;

  // clave foranea usuario
  @ManyToOne(() => UsuarioEntity)
  @JoinColumn({ name: 'id_usuario' })
  idUsuario!: UsuarioEntity;

  // clave foranea sala
  @ManyToOne(() => SalaEntity)
  @JoinColumn({ name: 'id_sala' })
  idSala!: SalaEntity;

  @Column({ name: 'fecha_reserva', type: 'date' })
  fechaReserva!: Date;

  @Column({
    type: 'enum',
    enum: BloqueHorario,
    name: 'bloque_horario',
  })
  bloqueHorario!: BloqueHorario;

  @Column({
    type: 'enum',
    enum: EstadoReserva,
    default: EstadoReserva.ACTIVA,
  })
  estado!: EstadoReserva;

  @Column({ name: 'motivo_cancelacion', length: 255, nullable: true })
  motivoCancelacion?: string;
}
