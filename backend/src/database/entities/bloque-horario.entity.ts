import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReservaEntity } from './reserva.entity';

@Entity('bloques_horarios')
export class BloqueHorarioEntity {
  @PrimaryGeneratedColumn({ name: 'id_bloque' })
  idBloque!: number;

  @Column({ name: 'hora_inicio', type: 'time' })
  horaInicio!: string;

  @Column({ name: 'hora_fin', type: 'time' })
  horaFin!: string;

  @ManyToOne(() => ReservaEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_reserva' })
  reserva!: ReservaEntity;
}
