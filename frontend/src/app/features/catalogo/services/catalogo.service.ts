import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ILibro } from '../../../shared/interfaces/ilibro-detalle';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {

  private apiUrl = `${environment.apiUrl}/libros`;

  constructor(private http: HttpClient) {}

  // GET /libros — lista todos los libros (endpoint público, no requiere JWT)
  getLibros(): Observable<ILibro[]> {
    return this.http.get<ILibro[]>(this.apiUrl);
  }

  // GET /libros/:id — obtiene el detalle de un libro por su id
  getLibroPorId(id: number): Observable<ILibro> {
    return this.http.get<ILibro>(`${this.apiUrl}/${id}`);
  }
}
