import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReservaService } from '../../services/reservas.service';

const BLOQUES_CONFIG = [
  { id: 'A', rango: '08:00 - 09:00' },
  { id: 'B', rango: '09:00 - 10:00' },
  { id: 'C', rango: '10:00 - 11:00' },
  { id: 'D', rango: '11:00 - 12:00' },
  { id: 'E', rango: '12:00 - 13:00' },
  { id: 'F', rango: '13:00 - 14:00' },
  { id: 'G', rango: '14:00 - 15:00' },
  { id: 'H', rango: '15:00 - 16:00' },
  { id: 'I', rango: '16:00 - 17:00' },
  { id: 'J', rango: '17:00 - 18:00' },
  { id: 'K', rango: '18:00 - 19:00' },
];

@Component({
  selector: 'app-horario',
  templateUrl: './horario.component.html',
  styleUrls: ['./horario.component.css'],
})
export class HorarioComponent implements OnInit {
  dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  bloques = BLOQUES_CONFIG;
  bloquesAgotados = ['Lunes-A', 'Miércoles-C', 'Jueves-K'];

  seleccionActual: { dia: string; idBloque: string; rango?: string } | null =
    null;

  constructor(
    private reservaService: ReservaService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (this.reservaService.datosTemporales.filtroActivo) {
      this.filtroActivo = this.reservaService.datosTemporales.filtroActivo;
    }
    this.cargarSalas();
  }

  // Lógica de selección
  seleccionarCelda(dia: string, idBloque: string) {
    const bloqueEncontrado = this.bloques.find((b) => b.id === idBloque);
    this.seleccionActual = {
      dia: dia,
      idBloque: idBloque,
      rango: bloqueEncontrado ? bloqueEncontrado.rango : idBloque,
    };
  }

  esSeleccionado(dia: string, idBloque: string): boolean {
    return (
      this.seleccionActual?.dia === dia &&
      this.seleccionActual?.idBloque === idBloque
    );
  }

  esAgotado(dia: string, idBloque: string): boolean {
    return this.bloquesAgotados.includes(`${dia}-${idBloque}`);
  }

  // 1. Filtros
  filtros = ['Todos', 'Estudio', 'Auditorio', 'Computación'];
  filtroActivo = 'Todos';

  allSalas = [
    {
      idSala: 1,
      nombreSala: 'Sala 1-A',
      capacidad: 6,
      ubicacion: 'Aulario A',
      tipo: 'Estudio',
    },
    {
      idSala: 2,
      nombreSala: 'Sala 3-A',
      capacidad: 4,
      ubicacion: 'Aulario A',
      tipo: 'Estudio',
    },
    {
      idSala: 3,
      nombreSala: 'Sala 1-C',
      capacidad: 8,
      ubicacion: 'Aulario C',
      tipo: 'Estudio',
    },
    {
      idSala: 4,
      nombreSala: 'Auditorio Principal',
      capacidad: 50,
      ubicacion: 'Auditorio',
      tipo: 'Auditorio',
    },
    {
      idSala: 5,
      nombreSala: 'Auditorio Secundario',
      capacidad: 30,
      ubicacion: 'Auditorio',
      tipo: 'Auditorio',
    },
  ];

  cargarSalas() {
    this.reservaService.getSalas().subscribe({
      next: (salas) => {
        if (Array.isArray(salas) && salas.length) {
          this.allSalas = salas.map((s: any) => ({
            idSala: s.idSala ?? s.id,
            nombreSala: s.nombreSala ?? s.nombre ?? `Sala ${s.idSala ?? s.id}`,
            ubicacion: s.ubicacion ?? s.ubicacion_sala ?? '',
            tipo:
              s.ubicacion && s.ubicacion.toLowerCase().includes('auditorio')
                ? 'Auditorio'
                : (s.tipo ?? 'Estudio'),
            capacidad: s.capacidad ?? s.capacidad_sala ?? 0,
          }));
        }
      },
      error: (err) => {
        console.warn('No se pudieron cargar salas desde el backend:', err);
      },
    });
  }

  // 3. El filtro automático
  get salasFiltradas() {
    if (this.filtroActivo === 'Todos') return this.allSalas;
    return this.allSalas.filter((s) => s.tipo === this.filtroActivo);
  }

  setFiltro(filtro: string) {
    this.filtroActivo = filtro;
  }

  irADetalles(sala: any) {
    this.reservaService.guardarSala(sala);
    if (this.seleccionActual) {
      this.reservaService.guardarHorario(this.seleccionActual);
    }

    this.router.navigate(['/detalle-sala', sala.idSala]);
  }
  contarSalas(tipo: string): number {
    return this.allSalas.filter((sala) => sala.tipo === tipo).length;
  }
}
