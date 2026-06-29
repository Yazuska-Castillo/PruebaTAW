import { IsNotEmpty, IsNumber } from 'class-validator';

export class SolicitarPrestamoDto {
  @IsNotEmpty()
  @IsNumber()
  idLibro!: number;
}
