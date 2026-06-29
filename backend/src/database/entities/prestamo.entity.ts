import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UsuarioEntity } from './usuario.entity';
import { LibroEntity } from './libro.entity';
import { MultaEntity } from './multa.entity';

export enum EstadoPrestamo {
  ACTIVO = 1,
  DEVUELTO = 2,
  VENCIDO = 3,
  PERDIDO = 4,
}

@Entity('prestamos')
export class PrestamoEntity {
  @PrimaryGeneratedColumn({ name: 'id_prestamo' })
  idPrestamo!: number;

  @ManyToOne(() => UsuarioEntity)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: UsuarioEntity;

  @ManyToOne(() => LibroEntity)
  @JoinColumn({ name: 'id_libros' })
  libro!: LibroEntity;

  @OneToOne(() => MultaEntity, (multa) => multa.prestamo, { nullable: true })
  @JoinColumn({ name: 'id_multa' })
  multa?: MultaEntity;

  @Column({ name: 'fecha_prestamo', type: 'date' })
  fechaPrestamo!: Date;

  @Column({ name: 'fecha_devolucion_esperada', type: 'date' })
  fechaDevolucionEsperada!: Date;

  @Column({ name: 'fecha_devolucion_real', type: 'date', nullable: true })
  fechaDevolucionReal?: Date;

  @Column({ name: 'estado', type: 'int2' })
  estado!: number;

  @Column({ type: 'text', nullable: true })
  observacion?: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;
}