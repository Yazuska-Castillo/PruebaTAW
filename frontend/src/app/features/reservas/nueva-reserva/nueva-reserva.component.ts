import { Component } from '@angular/core';

@Component({
  selector: 'app-nueva-reserva',
  templateUrl: './nueva-reserva.component.html',
  styleUrls: ['./nueva-reserva.component.css']
})
export class NuevaReservaComponent {
  
  vistaActual: number = 1;

  datosReserva = {
    horarioElegido: null,
    salaElegida: null
  };

  // --- FUNCIONES PARA AVANZAR ---
  avanzarASalas(horario: any) {
    this.datosReserva.horarioElegido = horario;
    console.log("Horario guardado:", this.datosReserva.horarioElegido);
  }
}