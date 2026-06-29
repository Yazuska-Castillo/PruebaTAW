import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  IMultaHistorial,
  IResumenMultas,
  IPagarMultaRequest,
  IPagarMultaResponse
} from '../../../shared/interfaces/imulta-historial';

@Injectable({
  providedIn: 'root'
})
export class MultasService {

  private apiUrl = `${environment.apiUrl}/multas`;

  constructor(private http: HttpClient) {}

  // GET /multas/historial — todas las multas del usuario (pagadas y pendientes)
  getHistorial(): Observable<IMultaHistorial[]> {
    return this.http.get<IMultaHistorial[]>(`${this.apiUrl}/historial`);
  }

  // GET /multas/pendientes — solo las multas sin pagar
  getPendientes(): Observable<IMultaHistorial[]> {
    return this.http.get<IMultaHistorial[]>(`${this.apiUrl}/pendientes`);
  }

  // GET /multas/resumen — resumen con conteos y totales + historial completo
  getResumen(): Observable<IResumenMultas> {
    return this.http.get<IResumenMultas>(`${this.apiUrl}/resumen`);
  }

  // POST /multas/pagar — registra el pago de una multa
  pagarMulta(idMulta: number): Observable<IPagarMultaResponse> {
    const body: IPagarMultaRequest = { idMulta };
    return this.http.post<IPagarMultaResponse>(`${this.apiUrl}/pagar`, body);
  }
}
