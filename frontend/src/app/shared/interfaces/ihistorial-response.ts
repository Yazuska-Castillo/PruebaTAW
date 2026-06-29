import { IPrestamo } from './iprestamo';
import { IReserva } from './ireserva';

// Respuesta del endpoint GET /historial/mi-historial
export interface IHistorialResponse {
  prestamos: IPrestamo[];
  reservas: IReserva[];
}
