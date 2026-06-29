// Interfaces que reflejan exactamente la respuesta del backend (MultasService de Yazuska)

export interface ILibroResumenMulta {
  titulo: string;
  autor: string;
  valorLibro?: number;
}

export interface IPrestamoResumenMulta {
  fechaPrestamo: string;
  fechaDevolucionEsperada: string;
  fechaDevolucionReal: string | null;
  estado: string;
  diasAtraso: number;
}

export interface IMultaDetalle {
  idMulta: number;
  estadoPago: 'pendiente' | 'pagada';
  fechaGeneracion: string;
  fechaPago: string | null;
  monto: number | null;
  estadoLibro: 'devuelto_bueno' | 'perdido_total' | 'no_devuelto';
  // Estos campos opcionales los agrega el backend según el estado
  requiereDecision?: boolean;
  mensajeAdmin?: string;
  puedePagar?: boolean;
  mensajeUsuario?: string;
}

export interface IMultaHistorial {
  idPrestamo: number;
  libro: ILibroResumenMulta;
  prestamo: IPrestamoResumenMulta;
  multa: IMultaDetalle;
}

export interface IResumenMultas {
  resumen: {
    multasPendientes: number;
    totalPendiente: number;
    multasPagadas: number;
    totalPagado: number;
  };
  multasPendientes: IMultaHistorial[];
  historialMultas: IMultaHistorial[];
}

export interface IPagarMultaRequest {
  idMulta: number;
  condiciones?: 'BUENO' | 'PERDIDO';
}

export interface IPagarMultaResponse {
  success: boolean;
  message: string;
  data: {
    idMulta: number;
    monto: number;
    fechaPago: string;
    diasAtraso: number;
    estadoPrestamo: string;
    estadoLibro: string;
  };
}
