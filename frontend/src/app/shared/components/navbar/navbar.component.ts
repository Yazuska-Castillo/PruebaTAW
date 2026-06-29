import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  userName = '';
  userInitials = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const usuario = this.authService.getUsuario();
    if (usuario) {
      this.userName = `${usuario.nombre} ${usuario.apellido}`;
      // Genera las iniciales a partir del nombre y apellido
      this.userInitials = (usuario.nombre.charAt(0) + usuario.apellido.charAt(0)).toUpperCase();
    }
  }

  // Cierra la sesión del usuario y redirige al login
  logout(): void {
    this.authService.logout();
  }
}
