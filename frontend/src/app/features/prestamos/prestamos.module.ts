import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { CrearPrestamoComponent } from './crear-prestamo/crear-prestamo.component';
import { HistorialPrestamosComponent } from './historial-prestamos/historial-prestamos.component';

@NgModule({
  declarations: [CrearPrestamoComponent, HistorialPrestamosComponent],
  imports: [CommonModule, SharedModule, FormsModule, RouterModule],
  exports: [CrearPrestamoComponent, HistorialPrestamosComponent],
})
export class PrestamosModule {}
