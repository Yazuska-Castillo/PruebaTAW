import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PrestamosService } from '../services/prestamos.service';
import { IPrestamo } from '../../../shared/interfaces/iprestamo';
import { IReserva } from '../../../shared/interfaces/ireserva';

// Interfaz interna para unificar préstamos y reservas en la vista del historial
export interface IHistorialItem {
  id: number;
  tipo: 'prestamo' | 'reserva';
  titulo: string;
  fechaRetiro: Date;
  fechaDevolucion: Date;
  estado: 'activo' | 'finalizado' | 'cancelado' | 'vencido';
  bloqueHorario?: string; // Solo para reservas
}

// Mapa de bloque letra a rango horario (A-K del backend)
const BLOQUES_HORARIO: Record<string, string> = {
  A: '08:00 - 09:00',
  B: '09:00 - 10:00',
  C: '10:00 - 11:00',
  D: '11:00 - 12:00',
  E: '12:00 - 13:00',
  F: '13:00 - 14:00',
  G: '14:00 - 15:00',
  H: '15:00 - 16:00',
  I: '16:00 - 17:00',
  J: '17:00 - 18:00',
  K: '18:00 - 19:00',
};

function crearFechaLocal(fecha: string | Date): Date {
  if (fecha instanceof Date) return fecha;

  const [soloFecha] = fecha.split('T');
  const [year, month, day] = soloFecha.split('-').map(Number);

  if (!year || !month || !day) {
    return new Date(fecha);
  }

  return new Date(year, month - 1, day);
}

@Component({
  selector: 'app-historial-prestamos',
  templateUrl: './historial-prestamos.component.html',
  styleUrls: ['./historial-prestamos.component.css']
})
export class HistorialPrestamosComponent implements OnInit, OnDestroy {

  todosLosItems: IHistorialItem[] = [];
  filtroActivo: 'todos' | 'prestamos' | 'reservas' = 'todos';

  // Estado de carga general
  cargando = false;
  mensajeCargaError = '';

  // Estado del modal de detalle
  modalVisible = false;
  itemSeleccionado: IHistorialItem | null = null;
  motivoCancelacion = '';
  cancelando = false;
  mensajeModalExito = '';
  mensajeModalError = '';

  private sub!: Subscription;

  constructor(private prestamosService: PrestamosService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.mensajeCargaError = '';
    this.sub = this.prestamosService.getMiHistorial().subscribe({
      next: (data) => {
        const prestamosItems = data.prestamos.map(p => this.mapearPrestamo(p));
        const reservasItems = data.reservas.map(r => this.mapearReserva(r));
        // Combina y ordena por fecha de retiro descendente
        this.todosLosItems = [...prestamosItems, ...reservasItems].sort(
          (a, b) => b.fechaRetiro.getTime() - a.fechaRetiro.getTime()
        );
        this.cargando = false;
      },
      error: (err) => {
        if (err.status === 401) {
          this.mensajeCargaError = 'No estás autorizado. Inicia sesión nuevamente.';
        } else {
          this.mensajeCargaError = 'Error al cargar el historial. Intenta más tarde.';
        }
        this.cargando = false;
        console.error('Error al cargar historial:', err);
      }
    });
  }

  // Convierte una IPrestamo del backend a IHistorialItem para la vista
  private mapearPrestamo(p: IPrestamo): IHistorialItem {
    return {
      id: p.idPrestamo,
      tipo: 'prestamo',
      titulo: p.libro?.titulo ?? 'Libro sin título',
      fechaRetiro: crearFechaLocal(p.fechaPrestamo),
      fechaDevolucion: crearFechaLocal(p.fechaDevolucionEsperada),
      estado: this.mapearEstadoPrestamo(p.estado)
    };
  }

  // Convierte una IReserva del backend a IHistorialItem para la vista
  private mapearReserva(r: IReserva): IHistorialItem {
    return {
      id: r.idReserva,
      tipo: 'reserva',
      titulo: 'Sala de estudio',
      fechaRetiro: crearFechaLocal(r.fechaReserva),
      fechaDevolucion: crearFechaLocal(r.fechaReserva),
      estado: this.mapearEstadoReserva(r.estado),
      bloqueHorario: r.bloqueHorario
    };
  }

  // 1=ACTIVO, 2=DEVUELTO, 3=VENCIDO, 4=PERDIDO → estado de la vista
  private mapearEstadoPrestamo(estado: number): 'activo' | 'finalizado' | 'cancelado' | 'vencido' {
    if (estado === 1) return 'activo';
    if (estado === 2) return 'finalizado';
    if (estado === 3) return 'vencido';
    return 'vencido';
  }

  // 'Activa' / 'Cancelada' / 'Finalizada' → estado de la vista
  private mapearEstadoReserva(estado: string): 'activo' | 'finalizado' | 'cancelado' | 'vencido' {
    if (estado === 'Activa') return 'activo';
    if (estado === 'Cancelada') return 'cancelado';
    if (estado === 'Finalizada') return 'finalizado';
    return 'finalizado';
  }

  get itemsFiltrados(): IHistorialItem[] {
    if (this.filtroActivo === 'prestamos') {
      return this.todosLosItems.filter(i => i.tipo === 'prestamo');
    }
    if (this.filtroActivo === 'reservas') {
      return this.todosLosItems.filter(i => i.tipo === 'reserva');
    }
    return this.todosLosItems;
  }

  get cantidadPrestamos(): number {
    return this.todosLosItems.filter(i => i.tipo === 'prestamo').length;
  }

  get cantidadReservas(): number {
    return this.todosLosItems.filter(i => i.tipo === 'reserva').length;
  }

  get cantidadActivos(): number {
    return this.todosLosItems.filter(i => i.estado === 'activo').length;
  }

  setFiltro(filtro: 'todos' | 'prestamos' | 'reservas'): void {
    this.filtroActivo = filtro;
  }

  getBloqueTexto(bloque: string): string {
    return BLOQUES_HORARIO[bloque] ?? bloque;
  }

  abrirModal(item: IHistorialItem): void {
    this.itemSeleccionado = item;
    this.motivoCancelacion = '';
    this.mensajeModalExito = '';
    this.mensajeModalError = '';
    this.cancelando = false;
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.itemSeleccionado = null;
  }

  // Cancela la reserva activa llamando a PATCH /reserve/:id/cancel
  cancelarReserva(): void {
    if (!this.itemSeleccionado) return;

    this.cancelando = true;
    this.mensajeModalError = '';

    this.prestamosService.cancelarReserva(this.itemSeleccionado.id, this.motivoCancelacion).subscribe({
      next: () => {
        // Actualiza el estado localmente para reflejar el cambio sin recargar
        const index = this.todosLosItems.findIndex(i => i.id === this.itemSeleccionado!.id);
        if (index !== -1) {
          this.todosLosItems[index] = { ...this.todosLosItems[index], estado: 'cancelado' };
          this.itemSeleccionado = { ...this.todosLosItems[index] };
        }
        this.cancelando = false;
        this.mensajeModalExito = 'Reserva cancelada correctamente.';
      },
      error: (err) => {
        this.cancelando = false;
        if (err.status === 400) {
          this.mensajeModalError = 'No se puede cancelar esta reserva.';
        } else if (err.status === 403) {
          this.mensajeModalError = 'No tienes permiso para cancelar esta reserva.';
        } else {
          this.mensajeModalError = 'Error al cancelar. Intenta más tarde.';
        }
        console.error('Error al cancelar reserva:', err);
      }
    });
  }

  getTextoEstado(estado: string): string {
    const textos: Record<string, string> = {
      activo:     'Activo',
      finalizado: 'Finalizado',
      cancelado:  'Cancelado',
      vencido:    'Vencido'
    };
    return textos[estado] ?? estado;
  }
}
