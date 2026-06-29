import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ILibro } from '../../../shared/interfaces/ilibro-detalle';
import { CatalogoService } from '../../catalogo/services/catalogo.service';
import { AuthService } from '../../../core/services/auth.service';

// Sala de estudio — se mantiene en mock porque el backend aún no tiene GET /salas
export interface ISala {
  id: number;
  nombre: string;
  disponibilidad: 'disponible' | 'reservado';
}

@Component({
  selector: 'app-menu-principal-usuario',
  templateUrl: './menu-principal-usuario.component.html',
  styleUrls: ['./menu-principal-usuario.component.css'],
})
export class MenuPrincipalUsuarioComponent implements OnInit, OnDestroy {

  // Nombre del usuario autenticado
  userName = '';

  // Libros cargados desde el backend
  libros: ILibro[] = [];
  cargandoLibros = false;

  // Salas en mock (backend aún no tiene endpoint GET /salas)
  salas: ISala[] = [
    { id: 1, nombre: 'Parinacota',         disponibilidad: 'disponible' },
    { id: 2, nombre: 'Sala de Ciencias',   disponibilidad: 'reservado'  },
    { id: 3, nombre: 'Azufre',             disponibilidad: 'disponible' },
    { id: 4, nombre: 'Sala de Tecnología', disponibilidad: 'reservado'  },
    { id: 5, nombre: 'Belen',              disponibilidad: 'disponible' },
    { id: 6, nombre: 'Guallatire',         disponibilidad: 'disponible' },
  ];

  private sub!: Subscription;

  constructor(
    private catalogoService: CatalogoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtiene el nombre del usuario desde el token guardado en localStorage
    const usuario = this.authService.getUsuario();
    this.userName = usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Usuario';

    this.cargarLibros();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  cargarLibros(): void {
    this.cargandoLibros = true;
    this.sub = this.catalogoService.getLibros().subscribe({
      next: (libros) => {
        this.libros = libros;
        this.cargandoLibros = false;
      },
      error: (err) => {
        this.cargandoLibros = false;
        console.error('Error al cargar libros en inicio:', err);
      }
    });
  }

  // Devuelve solo los libros disponibles para mostrar en la sección de inicio
  get librosDisponibles(): ILibro[] {
    return this.libros.filter(libro => libro.disponible);
  }

  get salasDisponibles(): ISala[] {
    return this.salas.filter(sala => sala.disponibilidad === 'disponible');
  }

  getCoverColor(categoria: string | null): string {
    const map: { [key: string]: string } = {
      Literatura: '#702B9D',
      Ciencias:   '#009B8A',
      Historia:   '#330662',
      Tecnología: '#59B2D1',
      Filosofía:  '#7B5AA6',
    };
    return map[categoria ?? ''] ?? '#57068C';
  }

  getCoverAccent(categoria: string | null): string {
    const map: { [key: string]: string } = {
      Literatura: '#9B4BC7',
      Ciencias:   '#00BFA8',
      Historia:   '#5A0FA8',
      Tecnología: '#7EC8E3',
      Filosofía:  '#9B75C0',
    };
    return map[categoria ?? ''] ?? '#702B9D';
  }

  getInitial(nombre: string | null): string {
    return (nombre ?? '').charAt(0).toUpperCase();
  }
}
