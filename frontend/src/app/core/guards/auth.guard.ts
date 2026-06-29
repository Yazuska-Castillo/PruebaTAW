import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  // Permite el acceso solo si el usuario tiene un token en localStorage
  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    // Sin token → redirige al login
    this.router.navigate(['/login']);
    return false;
  }
}
