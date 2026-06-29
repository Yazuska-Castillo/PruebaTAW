import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListaLibrosComponent } from './features/catalogo/lista-libros/lista-libros.component';
import { DetalleLibroComponent } from './features/catalogo/detalle-libro/detalle-libro.component';
import { ListaMultasComponent } from './features/multas/lista-multas/lista-multas.component';
import { MenuPrincipalUsuarioComponent } from './features/menu-principal/menu-principal-usuario/menu-principal-usuario.component';
import { MenuPrincipalAdminComponent } from './features/menu-principal/menu-principal-admin/menu-principal-admin.component';
import { CrearPrestamoComponent } from './features/prestamos/crear-prestamo/crear-prestamo.component';
import { HistorialPrestamosComponent } from './features/prestamos/historial-prestamos/historial-prestamos.component';
import { LoginComponent } from './features/auth/login/login.component';
import { NuevaReservaComponent } from './features/reservas/nueva-reserva/nueva-reserva.component';
import { DetalleSalaComponent } from './features/reservas/nueva-reserva/detalle-sala/detalle-sala.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '',              component: MenuPrincipalUsuarioComponent, canActivate: [AuthGuard] },
  { path: 'inicio',        component: MenuPrincipalUsuarioComponent, canActivate: [AuthGuard] },
  { path: 'catalogo',      component: ListaLibrosComponent,          canActivate: [AuthGuard] },
  { path: 'catalogo/:id',  component: DetalleLibroComponent,         canActivate: [AuthGuard] },
  { path: 'multas',        component: ListaMultasComponent,          canActivate: [AuthGuard] },
  { path: 'historial',     component: HistorialPrestamosComponent,   canActivate: [AuthGuard] },
  { path: 'crear-prestamo', component: CrearPrestamoComponent,       canActivate: [AuthGuard] },
  { path: 'nueva-reserva', component: NuevaReservaComponent,         canActivate: [AuthGuard] },
  { path: 'detalle-sala/:id', component: DetalleSalaComponent,       canActivate: [AuthGuard] },
  { path: 'menu-admin',    component: MenuPrincipalAdminComponent,   canActivate: [AuthGuard] },
  { path: 'login',         component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
