// Interfaz que refleja la ReservaEntity del backend
export interface IReserva {
  idReserva: number;
  fechaReserva: string;
  bloqueHorario: string; // A-K según BloqueHorario enum del backend
  estado: string; // EstadoReserva: 'Activa', 'Cancelada', 'Finalizada'
  motivoCancelacion?: string;
}
