import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LibroEntity } from './libro.entity';
import { UsuarioEntity } from './usuario.entity';

export enum TipoTransaccion {
  PRESTAMO = 'PRESTAMO',
  DEVOLUCION = 'DEVOLUCION',
  RESERVA_SALA = 'RESERVA_SALA',
  MULTA = 'MULTA',
}

@Entity('historial_transacciones')
export class HistorialTransaccionEntity {
  @PrimaryGeneratedColumn({ name: 'id_transaccion' })
  idTransaccion!: number;

  @Column({
    name: 'tipo_transaccion',
    type: 'enum',
    enum: TipoTransaccion,
  })
  tipoTransaccion!: TipoTransaccion;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @ManyToOne(() => UsuarioEntity, { nullable: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario?: UsuarioEntity;

  @ManyToOne(() => LibroEntity, { nullable: true })
  @JoinColumn({ name: 'id_libros' })
  libro?: LibroEntity;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;
}
