export interface ILoginResponseDTO {
  accessToken: string;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    rol: string;
  };
}