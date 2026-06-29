import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ILoginRequestDTO } from '../../../shared/dtos/auth/login-request.dto';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  rolActivo: string = 'estudiante';

  loginData: ILoginRequestDTO = {
    correo: '',
    password: ''
  };

  mensajeError: string = '';
  cargando: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  cambiarRol(rol: string): void {
    this.rolActivo = rol;
    this.loginData = { correo: '', password: '' };
    this.mensajeError = '';
  }

  onSubmit(form: any): void {
    if (form.invalid) {
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        const rolUsuario = response.usuario.rol;

        if (this.rolActivo === 'administrador' && rolUsuario !== 'ADMIN') {
          this.mensajeError = 'Este usuario no tiene permisos de administrador.';
          this.authService.logout();
          this.cargando = false;
          return;
        }

        if (this.rolActivo === 'estudiante' && rolUsuario === 'ADMIN') {
          this.mensajeError = 'Selecciona el rol administrador para ingresar.';
          this.authService.logout();
          this.cargando = false;
          return;
        }

        if (rolUsuario === 'ADMIN') {
          this.router.navigate(['/menu-admin']);
        } else {
          this.router.navigate(['/inicio']);
        }

        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'Correo o contraseña incorrectos.';
        this.cargando = false;
      }
    });
  }
}