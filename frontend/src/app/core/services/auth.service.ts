import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ILoginRequestDTO } from '../../shared/dtos/auth/login-request.dto';
import { ILoginResponseDTO } from '../../shared/dtos/auth/login-response.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credenciales: ILoginRequestDTO): Observable<ILoginResponseDTO> {
    return this.http
      .post<ILoginResponseDTO>(`${this.apiUrl}/login`, credenciales)
      .pipe(
        tap((response) => {
          this.guardarToken(response.accessToken);
          this.guardarUsuario(response.usuario);
        })
      );
  }

  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  guardarUsuario(usuario: ILoginResponseDTO['usuario']): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuario(): ILoginResponseDTO['usuario'] | null {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getRol(): string {
    const usuario = this.getUsuario();

    if (usuario?.rol) {
      return usuario.rol;
    }

    const token = this.getToken();

    if (!token) {
      return '';
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol ?? '';
    } catch {
      return '';
    }
  }

  esAdmin(): boolean {
    return this.getRol() === 'ADMIN';
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}