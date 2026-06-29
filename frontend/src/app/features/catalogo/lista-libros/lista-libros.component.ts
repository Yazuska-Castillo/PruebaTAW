import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ILibro } from '../../../shared/interfaces/ilibro-detalle';
import { CatalogoService } from '../services/catalogo.service';

@Component({
  selector: 'app-lista-libros',
  templateUrl: './lista-libros.component.html',
  styleUrls: ['./lista-libros.component.scss']
})
export class ListaLibrosComponent implements OnInit, OnDestroy {

  searchQuery = '';
  filtroActivo = 'todos';

  filtros = ['Todos', 'Disponibles', 'Literatura', 'Ciencias', 'Historia', 'Tecnología', 'Filosofía'];

  libros: ILibro[] = [];
  cargando = false;
  mensajeError = '';

  private sub!: Subscription;

  constructor(private catalogoService: CatalogoService) {}

  ngOnInit(): void {
    this.cargarLibros();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  cargarLibros(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.sub = this.catalogoService.getLibros().subscribe({
      next: (libros) => {
        this.libros = libros;
        this.cargando = false;
      },
      error: (err) => {
        this.mensajeError = 'Error al cargar el catálogo. Intenta más tarde.';
        this.cargando = false;
        console.error('Error al cargar catálogo:', err);
      }
    });
  }

  // Filtra por búsqueda de texto y por el chip activo
  get librosFiltrados(): ILibro[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.libros.filter(libro => {
      const matchSearch = !q ||
        (libro.titulo ?? '').toLowerCase().includes(q) ||
        (libro.autor ?? '').toLowerCase().includes(q);

      const f = this.filtroActivo;
      const matchFiltro =
        f === 'todos' ||
        (f === 'disponibles' && libro.disponible) ||
        (libro.categoria ?? '').toLowerCase() === f.toLowerCase();

      return matchSearch && matchFiltro;
    });
  }

  setFiltro(filtro: string): void {
    this.filtroActivo = filtro.toLowerCase();
  }

  // El backend devuelve anio como 'YYYY-MM-DD'; extrae solo el año de 4 dígitos
  getAnio(anio: string | null): string {
    if (!anio) return '';
    return anio.substring(0, 4);
  }

  // Texto del badge de disponibilidad según el estado numérico del backend
  getTextoEstadoLibro(libro: ILibro): string {
    if (libro.disponible) return 'Disponible';
    const textos: { [key: number]: string } = {
      2: 'Prestado',
      3: 'Mantenimiento',
      4: 'Extraviado'
    };
    return textos[libro.estado] ?? 'No disponible';
  }

  getCoverColor(categoria: string | null): string {
    const map: { [key: string]: string } = {
      'Literatura':  '#702B9D',
      'Ciencias':    '#009B8A',
      'Historia':    '#330662',
      'Tecnología':  '#59B2D1',
      'Filosofía':   '#7B5AA6',
    };
    return map[categoria ?? ''] ?? '#57068C';
  }

  getCoverAccent(categoria: string | null): string {
    const map: { [key: string]: string } = {
      'Literatura':  '#9B4BC7',
      'Ciencias':    '#00BFA8',
      'Historia':    '#5A0FA8',
      'Tecnología':  '#7EC8E3',
      'Filosofía':   '#9B75C0',
    };
    return map[categoria ?? ''] ?? '#702B9D';
  }

  getInitial(titulo: string | null): string {
    return (titulo ?? '').charAt(0).toUpperCase();
  }
}
