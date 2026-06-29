import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum RolUsuario {
  ADMIN = 'ADMIN',
  ESTUDIANTE = 'ESTUDIANTE',
}

@Entity('usuarios')
export class UsuarioEntity {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  idUsuario!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 100 })
  apellido!: string;

  @Column({ length: 12, unique: true })
  rut!: string;

  @Column({ length: 120, unique: true })
  correo!: string;

  @Column({ name: 'password_hash', length: 255, select: false })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
    default: RolUsuario.ESTUDIANTE,
  })
  rol!: RolUsuario;

  @Column({ length: 20, nullable: true })
  telefono?: string;

  @Column({
    name: 'estado_academico',
    type: 'varchar',
    default: 'activo',
  })
  estadoAcademico!: string;

  @Column({ name: 'tiene_multa_impaga', default: false })
  tieneMultaImpaga!: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;
}
