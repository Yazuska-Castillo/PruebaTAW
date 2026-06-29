import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private apiUrl = `${environment.apiUrl}/reserve`;

  // guardado temporal en el flujo de reserva (UI)
  datosTemporales = {
    dia: '',
    hora: '',
    salaSeleccionada: null,
    filtroActivo: 'Todos',
  };

  private horarioSeleccionado: any = null;

  constructor(private http: HttpClient) {}

  guardarBloque(dia: string, hora: string) {
    this.datosTemporales.dia = dia;
    this.datosTemporales.hora = hora;
  }

  guardarSala(sala: any) {
    this.datosTemporales.salaSeleccionada = sala;
  }

  guardarHorario(horario: any) {
    this.horarioSeleccionado = horario;
    console.log('Horario guardado en el Servicio:', this.horarioSeleccionado);
  }

  obtenerHorario() {
    return this.horarioSeleccionado;
  }

  crearReserva(reserva: {
    idSala: number;
    fechaReserva: string;
    bloqueHorario: string;
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl, reserva);
  }

  getMisReservas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my`);
  }

  getSalas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/salas`);
  }

  getSalaById(idSala: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/salas/${idSala}`);
  }
}
