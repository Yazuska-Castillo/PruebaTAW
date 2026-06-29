// Interfaz que refleja exactamente los campos que devuelve LibroEntity del backend
export interface ILibro {
  idLibro: number;
  titulo: string | null;
  autor: string | null;
  isbn: string | null;
  editorial: string | null;
  categoria: string | null;
  anio: string | null; // El backend usa tipo date, llega como string 'YYYY-MM-DD'
  descripcion: string | null;
  stockDisponible: number;
  stockTotal: number;
  valorLibro: number;
  estado: number; // EstadoLibro: 1=DISPONIBLE, 2=PRESTADO, 3=MANTENIMIENTO, 4=EXTRAVIADO
  ubicacionFisica: string | null;
  disponible: boolean;
}
