import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateLibroDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  autor: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsString()
  @IsOptional()
  editorial?: string;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsDateString()
  @IsOptional()
  anio?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @Min(0)
  stockDisponible: number;

  @IsInt()
  @Min(0)
  stockTotal: number;

  @IsNumber()
  @Min(0)
  valorLibro: number;

  @IsString()
  @IsOptional()
  ubicacionFisica?: string;

  @IsBoolean()
  @IsOptional()
  disponible?: boolean;
}