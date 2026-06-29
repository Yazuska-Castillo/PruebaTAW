import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsString } from 'class-validator';

export class ReserveCreateDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la sala a reservar',
  })
  @IsNumber()
  idSala!: number;

  @ApiProperty({
    example: '2026-06-20',
    description: 'Fecha de la reserva (YYYY-MM-DD)',
  })
  @IsDateString()
  fechaReserva!: string;

  @ApiProperty({
    example: '10:00-12:00',
    description: 'Bloque horario (HH:MM-HH:MM)',
  })
  @IsString()
  bloqueHorario!: string;
}
