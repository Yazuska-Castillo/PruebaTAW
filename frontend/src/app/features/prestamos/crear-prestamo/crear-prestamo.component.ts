import { Component } from '@angular/core';
import { ILibro } from '../../../shared/interfaces/ilibro-detalle';

@Component({
  selector: 'app-crear-prestamo',
  templateUrl: './crear-prestamo.component.html',
  styleUrls: ['./crear-prestamo.component.css'],
})
export class CrearPrestamoComponent {

  // Libro de ejemplo para mostrar en la vista previa del formulario
  libro: Partial<ILibro> = {
    titulo: 'Cien Años de Soledad',
    autor: 'Gabriel García Márquez',
    categoria: 'Literatura',
    disponible: true,
  };

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

  getInitial(titulo: string | null): string {
    return (titulo ?? '').charAt(0).toUpperCase();
  }

  today = new Date().toISOString().split('T')[0];
}
