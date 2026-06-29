import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum EstadoLibro {
  DISPONIBLE = 1,
  PRESTADO = 2,
  MANTENIMIENTO = 3,
  EXTRAVIADO = 4,
}

@Entity('libros')
export class LibroEntity {
  @PrimaryGeneratedColumn({ name: 'id_libros' })
  idLibro!: number;

  @Column({ name: 'titulo', type: 'varchar', nullable: true })
  titulo!: string | null;

  @Column({ name: 'autor', type: 'varchar', nullable: true })
  autor!: string | null;

  @Column({ name: 'isbn', type: 'varchar', nullable: true })
  isbn!: string | null;

  @Column({ name: 'editorial', type: 'varchar', nullable: true })
  editorial!: string | null;

  @Column({ name: 'categoria', type: 'varchar', nullable: true })
  categoria!: string | null;

  @Column({ name: 'anio', type: 'date', nullable: true })
  anio!: string | null;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ name: 'stock_disponible', type: 'int' })
  stockDisponible!: number;

  @Column({ name: 'stock_total', type: 'int' })
  stockTotal!: number;

  @Column({
    name: 'valor_libro',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 25000,
  })
  valorLibro!: number;

  @Column({ name: 'estado', type: 'int2' })
  estado!: number;

  @Column({ name: 'ubicacion_fisica', type: 'varchar', nullable: true })
  ubicacionFisica!: string | null;

  @Column({ name: 'disponible', type: 'bool' })
  disponible!: boolean;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp' })
  fechaCreacion!: Date;
}
