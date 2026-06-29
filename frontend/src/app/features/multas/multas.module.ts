import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ListaMultasComponent } from './lista-multas/lista-multas.component';
import { PagarMultaComponent } from './pagar-multa/pagar-multa.component';

@NgModule({
  declarations: [
    ListaMultasComponent,
    PagarMultaComponent
  ],
  imports: [
    SharedModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    ListaMultasComponent
  ]
})
export class MultasModule { }
