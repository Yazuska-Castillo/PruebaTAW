import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservaService } from '../../services/reservas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalles-sala',
  templateUrl: './detalle-sala.component.html',
  styleUrls: ['./detalle-sala.component.css'],
})
export class DetalleSalaComponent implements OnInit {
  // 1. Objeto alineado con el Backend
  sala: any = {
    idSala: null,
    nombreSala: 'Cargando...',
    ubicacion: '',
    tipo: '',
    capacidad: 0,
    equipamiento: '',
  };

  // 2. Mock data
  private salasFalsas = [
    {
      idSala: 1,
      nombreSala: 'Sala de Estudio A',
      ubicacion: 'Aulario A',
      tipo: 'Estudio',
      capacidad: 6,
      equipamiento: 'Pizarra acrílica, 4 Sillas, Climatizador',
    },
    {
      idSala: 2,
      nombreSala: 'Sala de Estudio B',
      ubicacion: 'Aulario A',
      tipo: 'Estudio',
      capacidad: 4,
      equipamiento: 'Pizarra acrílica, Monitor HDMI',
    },
    {
      idSala: 3,
      nombreSala: 'Sala de Estudio C',
      ubicacion: 'Aulario C',
      tipo: 'Estudio',
      capacidad: 8,
      equipamiento: 'Proyector, Pizarra acrílica grande',
    },
    {
      idSala: 4,
      nombreSala: 'Auditorio Principal',
      ubicacion: 'Auditorio',
      tipo: 'Auditorio',
      capacidad: 50,
      equipamiento: 'Sistema de audio, Proyector Pro, 50 Butacas',
    },
    {
      idSala: 5,
      nombreSala: 'Auditorio Tecnológico',
      ubicacion: 'Auditorio',
      tipo: 'Auditorio',
      capacidad: 30,
      equipamiento: 'Telón motorizado, Micrófono inalámbrico',
    },
  ];

  horarioReserva: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservaService: ReservaService,
  ) {}

  ngOnInit(): void {
    const idUrl = this.route.snapshot.paramMap.get('id');
    if (!idUrl) {
      console.warn('No hay id en la URL, redirigiendo a nueva-reserva');
      this.router.navigate(['/nueva-reserva']);
      return;
    }

    const idBuscado = Number(idUrl);
    this.horarioReserva = this.reservaService.obtenerHorario();
    console.log('Horario recuperado en detalles:', this.horarioReserva);

    // Intentar cargar sala desde backend; si falla, usar mock local
    this.reservaService.getSalaById(idBuscado).subscribe({
      next: (sala) => {
        if (sala) this.sala = sala;
      },
      error: (err) => {
        console.warn('Error cargando sala desde backend, usando mock:', err);
        const salaEncontrada = this.salasFalsas.find(
          (s) => s.idSala === idBuscado,
        );
        if (salaEncontrada) this.sala = salaEncontrada;
        else this.router.navigate(['/nueva-reserva']);
      },
    });
  }
  getColorFondo(tipo: string): string {
    if (tipo === 'Sala de Estudio') {
      return 'linear-gradient(145deg, #57068C, #8E2DE2)';
    } else if (tipo === 'Auditorio') {
      return 'linear-gradient(145deg, #008080, #00ced1)';
    }
    return 'linear-gradient(145deg, #6B7280, #9CA3AF)';
  }

  confirmarReservaFinal() {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#F0FDF4',
      color: '#065F46',
      iconColor: '#10B981',
      didOpen: (toast: HTMLElement) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
      customClass: {
        popup: 'mi-alerta',
      },
    });
    if (!this.horarioReserva || !this.sala?.idSala) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta sala o horario.',
      });
      this.router.navigate(['/nueva-reserva']);
      return;
    }

    const payload = {
      idSala: this.sala.idSala,
      fechaReserva: this.getNextDateForWeekday(this.horarioReserva.dia),
      bloqueHorario: this.horarioReserva.idBloque,
    };

    this.reservaService.crearReserva(payload).subscribe({
      next: (resp) => {
        Toast.fire({
          icon: 'success',
          title: '¡Reserva Exitosa!',
          text: `Reserva creada.`,
        }).then(() => this.router.navigate(['/nueva-reserva']));
      },
      error: (err) => {
        const msg =
          err?.error?.message || err?.message || 'Error creando reserva';
        Swal.fire({ icon: 'error', title: 'No se pudo reservar', text: msg });
      },
    });
  }

  private getNextDateForWeekday(dia: string): string {
    const map: Record<string, number> = {
      Lunes: 1,
      Martes: 2,
      Miércoles: 3,
      Miercoles: 3,
      Jueves: 4,
      Viernes: 5,
    };
    const target = map[dia];
    if (target === undefined) return new Date().toISOString().slice(0, 10);
    const hoy = new Date();
    const hoyNum = hoy.getDay();
    let offset = target - hoyNum;
    if (offset <= 0) offset += 7;
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + offset);
    return fecha.toISOString().split('T')[0];
  }
}
