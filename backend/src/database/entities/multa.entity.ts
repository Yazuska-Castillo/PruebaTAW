import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PrestamoEntity } from './prestamo.entity';

export enum EstadoPagoMulta {
  PENDIENTE = 1,
  PAGADA = 2,
}

export enum EstadoLibroDevuelto {
  DEVUELTO_BUENO = 1,
  PERDIDO_TOTAL = 2,
}

@Entity('multas')
export class MultaEntity {
  @PrimaryGeneratedColumn({ name: 'id_multa' })
  idMulta!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monto!: number | null;

  @Column({ name: 'dias_atraso', type: 'int', default: 0 })
  diasAtraso!: number;

  @Column({
    name: 'estado_pago',
    type: 'smallint',
    enum: EstadoPagoMulta,
    default: EstadoPagoMulta.PENDIENTE,
  })
  estadoPago!: EstadoPagoMulta;

  @Column({
    name: 'estado_libro',
    type: 'smallint',
    nullable: true,
    default: null,
  })
  estadoLibro!: EstadoLibroDevuelto | null;

  @Column({ name: 'fecha_generacion', type: 'date' })
  fechaGeneracion!: Date;

  @Column({ name: 'fecha_pago', type: 'date', nullable: true })
  fechaPago!: Date | null;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string;

  @OneToOne(() => PrestamoEntity, (prestamo) => prestamo.multa)
  prestamo!: PrestamoEntity;
}
