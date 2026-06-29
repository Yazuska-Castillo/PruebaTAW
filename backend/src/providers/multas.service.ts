import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, IsNull, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import {
  EstadoLibroDevuelto,
  EstadoPagoMulta,
  MultaEntity,
} from 'src/database/entities/multa.entity';
import {
  PrestamoEntity,
  EstadoPrestamo,
} from 'src/database/entities/prestamo.entity';
import { UsuarioEntity } from 'src/database/entities/usuario.entity';
import { LibroEntity } from 'src/database/entities/libro.entity';

@Injectable()
export class MultasService {
  constructor(
    @InjectRepository(PrestamoEntity)
    private readonly prestamosRepository: Repository<PrestamoEntity>,

    @InjectRepository(MultaEntity)
    private readonly multaRepository: Repository<MultaEntity>,

    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,

    @InjectRepository(LibroEntity)
    private readonly libroRepository: Repository<LibroEntity>,
  ) {}

  private calcularMultaPorDia(valorLibro: number): number {
    return valorLibro * 0.01;
  }

  private calcularDiasAtraso(
    fechaEsperada: Date | string,
    fechaActual: Date = new Date(),
  ): number {
    const hoySinHora = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth(),
      fechaActual.getDate(),
    );
    const fe = new Date(fechaEsperada);
    const fechaEsperadaSinHora = new Date(
      fe.getFullYear(),
      fe.getMonth(),
      fe.getDate(),
    );

    if (hoySinHora <= fechaEsperadaSinHora) return 0;

    const diferencia = hoySinHora.getTime() - fechaEsperadaSinHora.getTime();
    return Math.floor(diferencia / (1000 * 3600 * 24));
  }

  private mapearEstadoLibro(estadoLibro: EstadoLibroDevuelto | null): string {
    if (estadoLibro === null) {
      return 'no_devuelto';
    }
    return estadoLibro === EstadoLibroDevuelto.DEVUELTO_BUENO
      ? 'devuelto_bueno'
      : 'perdido_total';
  }

  private calcularMontoEnVivo(
    prestamo: PrestamoEntity,
    multa: MultaEntity,
  ): {
    monto: number | null;
    estadoLibro: EstadoLibroDevuelto | null;
    requiereDecision: boolean;
  } {
    const valorLibro = Number(prestamo.libro.valorLibro);
    const multaPorDia = this.calcularMultaPorDia(valorLibro);
    const diasAtraso = multa.diasAtraso;
    const montoPorAtraso = diasAtraso * multaPorDia;

    // CASO 1: La multa ya está pagada - mostrar el monto guardado
    if (multa.estadoPago === EstadoPagoMulta.PAGADA) {
      return {
        monto: multa.monto ? Number(multa.monto) : null,
        estadoLibro: multa.estadoLibro,
        requiereDecision: false,
      };
    }

    // CASO 2: El préstamo está marcado como PERDIDO
    if (prestamo.estado === EstadoPrestamo.PERDIDO) {
      return {
        monto: valorLibro + montoPorAtraso,
        estadoLibro: EstadoLibroDevuelto.PERDIDO_TOTAL,
        requiereDecision: false,
      };
    }

    // CASO 3: El préstamo está marcado como DEVUELTO (en buen estado)
    if (prestamo.estado === EstadoPrestamo.DEVUELTO) {
      return {
        monto: montoPorAtraso,
        estadoLibro: EstadoLibroDevuelto.DEVUELTO_BUENO,
        requiereDecision: false,
      };
    }

    // CASO 4: Aún no ha decidido (préstamo vencido o activo)
    // No mostrar monto, mostrar opciones
    return {
      monto: null,
      estadoLibro: null,
      requiereDecision: true,
    };
  }

  // HU-06: Ver multas
  async getHistorialMultas(userId: number) {
    const prestamos = await this.prestamosRepository.find({
      where: {
        usuario: { idUsuario: userId },
        multa: Not(IsNull()),
      },
      relations: { multa: true, libro: true },
      order: { multa: { fechaGeneracion: 'DESC' } },
    });

    return prestamos.map((p) => {
      const multa = p.multa!;
      const valorLibro = Number(p.libro.valorLibro);
      const multaPorDia = this.calcularMultaPorDia(valorLibro);
      const diasAtraso = multa.diasAtraso;

      const montoEnVivo = this.calcularMontoEnVivo(p, multa);

      const montoPorAtraso = diasAtraso * multaPorDia;
      const montoPerdido = valorLibro + montoPorAtraso;

      const estaPagada = multa.estadoPago === EstadoPagoMulta.PAGADA;

      return {
        idPrestamo: p.idPrestamo,
        libro: {
          titulo: p.libro.titulo,
          autor: p.libro.autor,
          valorLibro: valorLibro,
        },
        prestamo: {
          fechaPrestamo: p.fechaPrestamo,
          fechaDevolucionEsperada: p.fechaDevolucionEsperada,
          fechaDevolucionReal: p.fechaDevolucionReal,
          estado: p.estado,
          diasAtraso: diasAtraso,
        },
        multa: {
          idMulta: multa.idMulta,
          estadoPago: multa.estadoPago === 1 ? 'pendiente' : 'pagada',
          fechaGeneracion: multa.fechaGeneracion,
          fechaPago: multa.fechaPago,

          monto: montoEnVivo.monto,
          estadoLibro: this.mapearEstadoLibro(montoEnVivo.estadoLibro),

          ...(!estaPagada &&
            montoEnVivo.requiereDecision && {
              requiereDecision: true,
              mensajeAdmin:
                'El libro está pendiente de revisión por el administrador',
            }),

          ...(!estaPagada &&
            !montoEnVivo.requiereDecision &&
            montoEnVivo.monto !== null && {
              puedePagar: true,
              mensajeUsuario:
                p.estado === EstadoPrestamo.PERDIDO
                  ? 'Libro reportado como perdido/dañado. Debes pagar el valor del libro más la multa por atraso.'
                  : 'Libro devuelto en buen estado. Debes pagar solo la multa por atraso.',
            }),
        },
      };
    });
  }

  // HU-06: Ver multas pendientes
  async getMultasPendientes(userId: number) {
    const prestamos = await this.prestamosRepository.find({
      where: {
        usuario: { idUsuario: userId },
        multa: { estadoPago: EstadoPagoMulta.PENDIENTE },
      },
      relations: { multa: true, libro: true },
      order: { multa: { fechaGeneracion: 'DESC' } },
    });

    return prestamos.map((p) => {
      const multa = p.multa!;
      const valorLibro = Number(p.libro.valorLibro);
      const multaPorDia = this.calcularMultaPorDia(valorLibro);
      const diasAtraso = multa.diasAtraso;

      const montoEnVivo = this.calcularMontoEnVivo(p, multa);

      const montoPorAtraso = diasAtraso * multaPorDia;
      const montoPerdido = valorLibro + montoPorAtraso;

      const estaPagada = multa.estadoPago === EstadoPagoMulta.PAGADA;

      return {
        idPrestamo: p.idPrestamo,
        libro: {
          titulo: p.libro.titulo,
          autor: p.libro.autor,
          valorLibro: valorLibro,
        },
        prestamo: {
          fechaPrestamo: p.fechaPrestamo,
          fechaDevolucionEsperada: p.fechaDevolucionEsperada,
          fechaDevolucionReal: p.fechaDevolucionReal,
          estado: p.estado,
          diasAtraso: diasAtraso,
        },
        multa: {
          idMulta: multa.idMulta,
          estadoPago: multa.estadoPago === 1 ? 'pendiente' : 'pagada',
          fechaGeneracion: multa.fechaGeneracion,
          fechaPago: multa.fechaPago,

          monto: montoEnVivo.monto,
          estadoLibro: this.mapearEstadoLibro(montoEnVivo.estadoLibro),

          ...(!estaPagada &&
            montoEnVivo.requiereDecision && {
              requiereDecision: true,
              mensajeAdmin:
                'El libro está pendiente de revisión por el administrador',
            }),

          ...(!estaPagada &&
            !montoEnVivo.requiereDecision &&
            montoEnVivo.monto !== null && {
              puedePagar: true,
              mensajeUsuario:
                p.estado === EstadoPrestamo.PERDIDO
                  ? 'Libro reportado como perdido/dañado. Debes pagar el valor del libro más la multa por atraso.'
                  : p.fechaDevolucionReal
                    ? 'Libro devuelto en buen estado. Debes pagar solo la multa por atraso.'
                    : 'Préstamo vencido. El libro aún no ha sido devuelto.',
            }),
        },
      };
    });
  }

  // HU-05: Calcular y generar multa
  async actualizarMultaPorVencimiento(prestamo: PrestamoEntity): Promise<void> {
    const diasAtraso = this.calcularDiasAtraso(
      prestamo.fechaDevolucionEsperada,
    );
    if (diasAtraso === 0) return;

    const multaPorDia = this.calcularMultaPorDia(prestamo.libro.valorLibro);
    const nuevoMonto = diasAtraso * multaPorDia;

    if (prestamo.multa) {
      // Actualizar multa existente
      if (prestamo.multa.diasAtraso !== diasAtraso) {
        prestamo.multa.diasAtraso = diasAtraso;
        prestamo.multa.monto = nuevoMonto;
        await this.multaRepository.save(prestamo.multa);
        console.log(
          `Multa ${prestamo.multa.idMulta} actualizada: ${diasAtraso} días - $${nuevoMonto}`,
        );
      }
    } else {
      // Crear nueva multa
      const multa = this.multaRepository.create({
        monto: nuevoMonto,
        diasAtraso: diasAtraso,
        estadoPago: EstadoPagoMulta.PENDIENTE,
        fechaGeneracion: new Date(),
      });
      const multaGuardada = await this.multaRepository.save(multa);
      prestamo.multa = multaGuardada;
      prestamo.estado = EstadoPrestamo.VENCIDO;
      await this.prestamosRepository.save(prestamo);

      await this.usuarioRepository.update(
        { idUsuario: prestamo.usuario.idUsuario },
        { tieneMultaImpaga: true },
      );
      console.log(
        `Multa generada para préstamo ${prestamo.idPrestamo}: ${diasAtraso} días - $${nuevoMonto}`,
      );
    }
  }

  async pagarMulta(
    idMulta: number,
    userId: number,
    condiciones?: 'BUENO' | 'PERDIDO',
  ): Promise<any> {
    const prestamo = await this.prestamosRepository.findOne({
      where: { multa: { idMulta: idMulta } },
      relations: ['usuario', 'multa', 'libro'],
    });

    if (!prestamo)
      throw new NotFoundException(
        'No se encontró un préstamo asociado a esta multa',
      );

    const multa = prestamo.multa;
    if (!multa) throw new NotFoundException('Multa no encontrada');
    if (multa.estadoPago === EstadoPagoMulta.PAGADA) {
      throw new BadRequestException('Esta multa ya fue pagada');
    }
    if (prestamo.usuario.idUsuario !== userId) {
      throw new ForbiddenException(
        'No puedes pagar una multa que no te pertenece',
      );
    }

    const hoy = new Date();
    const valorLibro = Number(prestamo.libro.valorLibro) || 25000;
    const multaPorDia = this.calcularMultaPorDia(valorLibro);
    const diasAtraso = multa.diasAtraso;

    let montoReal = 0;
    let estadoLibro: EstadoLibroDevuelto | null = null;
    let mensaje = '';

    if (
      prestamo.estado === EstadoPrestamo.PERDIDO ||
      condiciones === 'PERDIDO'
    ) {
      montoReal = valorLibro + diasAtraso * multaPorDia;
      estadoLibro = EstadoLibroDevuelto.PERDIDO_TOTAL;
      mensaje = `Multa pagada por libro PERDIDO: $${montoReal.toFixed(2)} (Valor libro: $${valorLibro} + ${diasAtraso} días de atraso: $${(diasAtraso * multaPorDia).toFixed(2)})`;

      if (prestamo.estado !== EstadoPrestamo.PERDIDO) {
        prestamo.libro.stockTotal -= 1;
        prestamo.libro.stockDisponible -= 1;
        prestamo.libro.estado = 4; // EXTRAVIADO
        await this.libroRepository.save(prestamo.libro);

        prestamo.estado = EstadoPrestamo.PERDIDO;
        prestamo.fechaDevolucionReal = hoy;
        await this.prestamosRepository.save(prestamo);
      }
    } else if (
      condiciones === 'BUENO' ||
      prestamo.fechaDevolucionReal !== null
    ) {
      montoReal = diasAtraso * multaPorDia;
      estadoLibro = EstadoLibroDevuelto.DEVUELTO_BUENO;
      mensaje = `Multa pagada por DEVOLUCIÓN en buen estado: $${montoReal.toFixed(2)} (${diasAtraso} días de atraso a $${multaPorDia.toFixed(2)}/día)`;

      if (prestamo.fechaDevolucionReal === null) {
        prestamo.libro.stockDisponible += 1;
        await this.libroRepository.save(prestamo.libro);

        prestamo.estado = EstadoPrestamo.DEVUELTO;
        prestamo.fechaDevolucionReal = hoy;
        await this.prestamosRepository.save(prestamo);
      }
    } else {
      montoReal = diasAtraso * multaPorDia;
      estadoLibro = null;
      mensaje = `Multa pagada: $${montoReal.toFixed(2)} (${diasAtraso} días de atraso a $${multaPorDia.toFixed(2)}/día). El libro aún no ha sido devuelto.`;

      console.log(`Pago sin devolución - Préstamo ID: ${prestamo.idPrestamo}`);
    }

    multa.monto = montoReal;
    multa.diasAtraso = diasAtraso;
    multa.estadoLibro = estadoLibro;
    multa.estadoPago = EstadoPagoMulta.PAGADA;
    multa.fechaPago = hoy;
    await this.multaRepository.save(multa);

    const otrasMultasPendientes = await this.prestamosRepository.count({
      where: {
        usuario: { idUsuario: userId },
        multa: { estadoPago: EstadoPagoMulta.PENDIENTE },
        idPrestamo: Not(prestamo.idPrestamo),
      },
      relations: ['multa'],
    });

    if (otrasMultasPendientes === 0) {
      await this.usuarioRepository.update(
        { idUsuario: userId },
        { tieneMultaImpaga: false },
      );
    }

    return {
      success: true,
      message: mensaje,
      data: {
        idMulta: multa.idMulta,
        monto: montoReal,
        fechaPago: multa.fechaPago,
        diasAtraso: diasAtraso,
        estadoPrestamo: prestamo.estado,
        estadoLibro: this.mapearEstadoLibro(estadoLibro),
      },
    };
  }

  // HU-05: Verificar préstamos vencidos automáticamente
  async verificarPrestamosVencidos(): Promise<void> {
    const prestamosVencidos = await this.prestamosRepository.find({
      where: {
        estado: EstadoPrestamo.ACTIVO,
        fechaDevolucionEsperada: LessThan(new Date()),
      },
      relations: ['multa', 'libro', 'usuario'],
    });

    for (const prestamo of prestamosVencidos) {
      await this.actualizarMultaPorVencimiento(prestamo);
    }
  }

  // Cron job que se ejecuta cada día a medianoche
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleVencimientoPrestamos() {
    console.log('Verificando préstamos vencidos...');
    await this.verificarPrestamosVencidos();
    console.log('Proceso de verificación de préstamos vencidos completado.');
  }

  async getResumenMultas(userId: number) {
    const pendientes = await this.getMultasPendientes(userId);
    const historial = await this.getHistorialMultas(userId);

    const totalPendiente = pendientes.reduce((sum, p) => {
      const monto = p.multa.monto;
      if (monto !== null && !p.multa.requiereDecision) {
        return sum + monto;
      }
      return sum;
    }, 0);

    const totalPagado = historial
      .filter((h) => h.multa.estadoPago === 'pagada')
      .reduce((sum, h) => sum + (Number(h.multa.monto) || 0), 0);

    const multasPendientesAccion = pendientes.filter(
      (p) =>
        p.multa.estadoPago === 'pendiente' &&
        p.multa.monto !== null &&
        !p.multa.requiereDecision,
    );

    const multasEnEspera = pendientes.filter(
      (p) =>
        p.multa.estadoPago === 'pendiente' && p.multa.requiereDecision === true,
    );

    return {
      resumen: {
        multasPendientes: pendientes.length,
        multasPendientesConMonto: multasPendientesAccion.length,
        multasEnEsperaDecision: multasEnEspera.length,
        totalPendiente: totalPendiente,
        multasPagadas: historial.filter((h) => h.multa.estadoPago === 'pagada')
          .length,
        totalPagado: totalPagado,
      },
      multasPendientes: pendientes,
      historialMultas: historial,
    };
  }

  /* Es para realizar pruebas
    async generarMultaPorVencimientoManual(prestamoId: number): Promise<any> {
        const prestamo = await this.prestamosRepository.findOne({
            where: { idPrestamo: prestamoId },
            relations: ['usuario', 'libro', 'multa']
        });

        if (!prestamo) {
            throw new NotFoundException('Préstamo no encontrado');
        }

        if (prestamo.multa) {
            throw new BadRequestException('Este préstamo ya tiene una multa');
        }

        const hoy = new Date();
        const fechaEsperada = new Date(prestamo.fechaDevolucionEsperada);

        if (hoy <= fechaEsperada) {
            throw new BadRequestException(`El préstamo no está vencido. Fecha esperada: ${fechaEsperada}`);
        }

        const diasAtraso = Math.floor((hoy.getTime() - fechaEsperada.getTime()) / (1000 * 3600 * 24));
        const monto = diasAtraso * 500;

        // Crear multa
        const multa = this.multaRepository.create({
            monto,
            diasAtraso,
            estadoPago: EstadoPagoMulta.PENDIENTE,
            fechaGeneracion: hoy
        });

        const multaGuardada = await this.multaRepository.save(multa);

        prestamo.multa = multaGuardada;
        prestamo.estado = EstadoPrestamo.VENCIDO;
        await this.prestamosRepository.save(prestamo);

        await this.usuarioRepository.update(
            { idUsuario: prestamo.usuario.idUsuario },
            { tieneMultaImpaga: true }
        );

        return {
            message: 'Multa generada exitosamente',
            prestamo: {
                id: prestamo.idPrestamo,
                libro: prestamo.libro.titulo,
                fechaEsperada: prestamo.fechaDevolucionEsperada,
                diasAtraso,
            },
            multa: {
                id: multaGuardada.idMulta,
                monto: multaGuardada.monto,
                diasAtraso: multaGuardada.diasAtraso,
                estado: multaGuardada.estadoPago
            }
        };
    } */
}
