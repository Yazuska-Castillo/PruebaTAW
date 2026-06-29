import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { ListaLibrosComponent } from './lista-libros/lista-libros.component';
import { DetalleLibroComponent } from './detalle-libro/detalle-libro.component';

@NgModule({
  declarations: [
    ListaLibrosComponent,
    DetalleLibroComponent
  ],
  imports: [
    SharedModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    ListaLibrosComponent,
    DetalleLibroComponent
  ]
})
export class CatalogoModule {}
