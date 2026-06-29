/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    example: 'rene@duoc.cl',
    description: 'Correo electrónico del usuario',
    required: true,
    type: String,
  })
  @IsEmail()
  correo!: string;

  @ApiProperty({
    example: '123456',
    description: 'Contraseña del usuario',
    required: true,
    type: String,
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
