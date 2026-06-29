import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ReserveResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la reserva',
  })
  @IsNumber()
  idReserva!: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la sala reservada',
  })
  @IsNumber()
  idSala!: number;

  @ApiProperty({
    example: '2026-06-20',
    description: 'Fecha de la reserva (YYYY-MM-DD)',
  })
  @IsString()
  fechaReserva!: string;

  @ApiProperty({
    example: '10:00-11:00',
    description: 'Bloque horario reservado',
  })
  @IsString()
  bloqueHorario!: string;

  @ApiProperty({
    example: 'Activa',
    description: 'Estado de la reserva (Activa, Cancelada, Finalizada)',
    enum: ['Activa', 'Cancelada', 'Finalizada'],
  })
  @IsString()
  estado!: string;

  @ApiProperty({
    example: 'Cambio de planes',
    description: 'Motivo de cancelación (solo si está cancelada)',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  motivoCancelacion?: string;
}
