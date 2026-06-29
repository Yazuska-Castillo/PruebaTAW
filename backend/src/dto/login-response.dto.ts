import { RolUsuario } from '../database/entities/usuario.entity';

export class LoginResponseDto {
  accessToken!: string;
  usuario!: {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    rol: RolUsuario;
  };
}
