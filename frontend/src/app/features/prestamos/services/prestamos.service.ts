import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IHistorialResponse } from '../../../shared/interfaces/ihistorial-response';

// Respuesta del backend al solicitar un préstamo
export interface ISolicitarPrestamoResponse {
  message: string;
  prestamo: {
    idPrestamo: number;
    fechaPrestamo: string;
    fechaDevolucionEsperada: string;
    estado: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class PrestamosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // POST /prestamos/solicitar — crea un préstamo para el usuario autenticado
  solicitarPrestamo(idLibro: number): Observable<ISolicitarPrestamoResponse> {
    return this.http.post<ISolicitarPrestamoResponse>(
      `${this.apiUrl}/prestamos/solicitar`,
      { idLibro },
    );
  }

  // GET /historial/mi-historial — devuelve préstamos y reservas del usuario
  getMiHistorial(): Observable<IHistorialResponse> {
    return this.http.get<IHistorialResponse>(
      `${this.apiUrl}/historial/mi-historial`,
    );
  }

  // PATCH /reserve/:id/cancel — cancela una reserva activa del usuario
  cancelarReserva(
    idReserva: number,
    motivoCancelacion?: string,
  ): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reserve/${idReserva}/cancel`, {
      motivoCancelacion,
    });
  }

  // GET /multas/pendientes — obtiene multas pendientes del usuario
  getMultasPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/multas/pendientes`);
  }
}
