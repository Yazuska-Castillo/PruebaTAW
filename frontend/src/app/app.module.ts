import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CatalogoModule } from './features/catalogo/catalogo.module';
import { MultasModule } from './features/multas/multas.module';
import { MenuPrincipalModule } from './features/menu-principal/menu-principal.module';
import { PrestamosModule } from './features/prestamos/prestamos.module';
import { ReservasModule } from './features/reservas/reservas.module';
import { LoginComponent } from './features/auth/login/login.component';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    CatalogoModule,
    MultasModule,
    ReservasModule,
    MenuPrincipalModule,
    PrestamosModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
