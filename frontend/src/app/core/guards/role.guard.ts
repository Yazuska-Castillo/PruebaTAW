import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RolUsuario } from '../../shared/enums/rol-usuario.enum';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // Obtener el rol del usuario desde el token JWT almacenado
    const payload = localStorage.getItem('token')
      ? JSON.parse(atob(localStorage.getItem('token')!.split('.')[1]))
      : null;

    const rol: string = payload?.rol ?? '';

    // Solo el ADMIN puede acceder a rutas protegidas por este guard
    if (rol === RolUsuario.ADMIN) {
      return true;
    }

    // El ESTUDIANTE u otros roles son redirigidos al inicio
    if (rol === RolUsuario.ESTUDIANTE) {
      this.router.navigate(['/inicio']);
      return false;
    }

    // Sin token válido, redirigir al login
    this.router.navigate(['/login']);
    return false;
  }

}
