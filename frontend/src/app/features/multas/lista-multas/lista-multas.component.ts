import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MultasService } from '../services/multas.service';
import { IMultaHistorial } from '../../../shared/interfaces/imulta-historial';

@Component({
  selector: 'app-lista-multas',
  templateUrl: './lista-multas.component.html',
  styleUrls: ['./lista-multas.component.css']
})
export class ListaMultasComponent implements OnInit, OnDestroy {

  // Lista completa de multas del usuario (pendientes + pagadas)
  todasLasMultas: IMultaHistorial[] = [];

  filtroActivo: 'todas' | 'pendientes' | 'pagadas' = 'todas';
  searchQuery = '';

  // Totales del resumen del backend
  totalPendiente = 0;
  totalPagado = 0;
  cantidadPendientes = 0;
  cantidadPagadas = 0;

  cargando = false;
  mensajeError = '';
  mensajeExito = '';

  pagandoId: number | null = null;

  private sub!: Subscription;

  constructor(private multasService: MultasService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // Llama a GET /multas/resumen para obtener todas las multas del usuario
  cargarDatos(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.sub = this.multasService.getResumen().subscribe({
      next: (data) => {
        // historialMultas incluye todas (pendientes y pagadas)
        this.todasLasMultas = data.historialMultas;
        this.cantidadPendientes = data.resumen.multasPendientes;
        this.cantidadPagadas    = data.resumen.multasPagadas;
        this.totalPendiente     = data.resumen.totalPendiente;
        this.totalPagado        = data.resumen.totalPagado;
        this.cargando = false;
      },
      error: (err) => {
        if (err.status === 401) {
          this.mensajeError = 'No estás autorizado. Inicia sesión nuevamente.';
        } else {
          this.mensajeError = 'Error al cargar las multas. Intenta más tarde.';
        }
        this.cargando = false;
        console.error('Error al cargar multas:', err);
      }
    });
  }

  get multasFiltradas(): IMultaHistorial[] {
    let resultado = this.todasLasMultas;

    if (this.filtroActivo === 'pendientes') {
      resultado = resultado.filter(m => m.multa.estadoPago === 'pendiente');
    } else if (this.filtroActivo === 'pagadas') {
      resultado = resultado.filter(m => m.multa.estadoPago === 'pagada');
    }

    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      resultado = resultado.filter(m =>
        m.libro.titulo.toLowerCase().includes(q) ||
        m.libro.autor.toLowerCase().includes(q)
      );
    }

    return resultado;
  }

  setFiltro(filtro: 'todas' | 'pendientes' | 'pagadas'): void {
    this.filtroActivo = filtro;
  }

  // Llama a POST /multas/pagar — placeholder del flujo de pago (integración con grupo de Pagos pendiente)
  pagarMulta(idMulta: number): void {
    this.pagandoId = idMulta;
    this.mensajeExito = '';
    this.mensajeError = '';

    this.multasService.pagarMulta(idMulta).subscribe({
      next: () => {
        this.mensajeExito = '¡Multa pagada exitosamente! Tu estado de cuenta ha sido actualizado.';
        this.pagandoId = null;
        this.cargarDatos();
      },
      error: (err) => {
        this.pagandoId = null;
        if (err.status === 400) {
          this.mensajeError = 'Esta multa ya fue pagada anteriormente.';
        } else if (err.status === 403) {
          this.mensajeError = 'No puedes pagar una multa que no te pertenece.';
        } else if (err.status === 404) {
          this.mensajeError = 'No se encontró la multa. Recarga la página.';
        } else {
          this.mensajeError = 'Error al procesar el pago. Intenta más tarde.';
        }
        console.error('Error al pagar multa:', err);
      }
    });
  }

  formatearMonto(monto: number | null): string {
    if (monto === null || monto === undefined) return '—';
    return monto.toLocaleString('es-CL');
  }

  getTextoEstadoLibro(estadoLibro: string): string {
    const textos: { [key: string]: string } = {
      'devuelto_bueno': 'Devuelto',
      'perdido_total':  'Extraviado',
      'no_devuelto':    'No devuelto'
    };
    return textos[estadoLibro] ?? estadoLibro;
  }
}
