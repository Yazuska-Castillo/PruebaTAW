import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum EstadoSala {
  DISPONIBLE = 'Disponible',
  MANTENIMIENTO = 'Mantenimiento',
  BLOQUEADA = 'Bloqueada',
}

export enum UbicacionSala {
  BIBLIOTECA = 'Biblioteca',
  AULARIO_A = 'Aulario A',
  AULARIO_C = 'Aulario C',
  CAFETERIA_A = 'Cafeteria A',
  CAFETERIA_B = 'Cafeteria B',
  AUDITORIO_INF = 'Auditorio',
}

@Entity('salas')
export class SalaEntity {
  @PrimaryGeneratedColumn({ name: 'id_sala' })
  idSala!: number;

  @Column({ name: 'nombre_sala', length: 50 })
  nombreSala!: string;

  @Column({ name: 'capacidad_sala', type: 'int' })
  capacidad!: number;

  @Column({
    type: 'enum',
    enum: UbicacionSala,
    name: 'ubicacion_sala',
  })
  ubicacion!: UbicacionSala;

  @Column({
    type: 'enum',
    enum: EstadoSala,
    default: EstadoSala.DISPONIBLE,
    name: 'estado_sala',
  })
  estado!: EstadoSala;
}
