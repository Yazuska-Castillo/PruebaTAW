import { Controller, Get, Post, Req, UseGuards, Body } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import { MultasService } from '../../providers/multas.service';

@ApiTags('Multas')
@ApiBearerAuth()
@Controller('multas')
@UseGuards(JwtAuthGuard)
export class MultasController {
  constructor(private readonly multasService: MultasService) {}

  @ApiOperation({
    summary: 'Obtener historial de multas',
    description: 'Retorna todas las multas del usuario (pagadas y pendientes)',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial obtenido exitosamente',
    schema: {
      example: [
        {
          idPrestamo: 5,
          libro: {
            titulo: 'Cien años de soledad',
            autor: 'Gabriel García Márquez',
          },
          multa: {
            idMulta: 2,
            monto: 1500,
            diasAtraso: 3,
            estadoPago: 'pagada',
            fechaGeneracion: '2026-06-01',
            fechaPago: '2026-06-03',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  @Get('historial')
  @ApiOperation({ summary: 'Obtener historial de multas del usuario' })
  getHistorial(@Req() req: any) {
    return this.multasService.getHistorialMultas(req.user.id);
  }

  @ApiOperation({ summary: 'Obtener multas pendientes' })
  @Get('pendientes')
  @ApiOperation({ summary: 'Obtener multas pendientes del usuario' })
  getPendientes(@Req() req: any) {
    return this.multasService.getMultasPendientes(req.user.id);
  }

  @ApiOperation({ summary: 'Obtener resumen de multas' })
  @Get('resumen')
  @ApiOperation({ summary: 'Obtener resumen completo de multas' })
  getResumen(@Req() req: any) {
    return this.multasService.getResumenMultas(req.user.id);
  }

  @Post('pagar')
  @ApiOperation({
    summary: 'Pagar una multa',
    description:
      'Paga una multa específica. El ID de la multa va en el body, no en la URL.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idMulta: {
          type: 'number',
          example: 5,
          description: 'ID de la multa a pagar',
        },
      },
      required: ['idMulta'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Multa pagada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Multa pagada exitosamente',
        data: {
          idMulta: 5,
          monto: 2500,
          fechaPago: '2026-06-08',
          diasAtraso: 5,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Multa no encontrada' })
  @ApiResponse({ status: 400, description: 'La multa ya fue pagada' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado para pagar esta multa',
  })
  async pagarMulta(
    @Body() body: { idMulta: number; condiciones?: 'BUENO' | 'PERDIDO' },
    @Req() req: any,
  ) {
    return this.multasService.pagarMulta(
      body.idMulta,
      req.user.id,
      body.condiciones,
    );
  }

  /* Es para realizar pruebas
  @Post('generar/:prestamoId')
  @ApiOperation({ summary: 'Generar multa manualmente para un préstamo vencido (solo pruebas)' })
  async generarMultaManual(@Param('prestamoId') prestamoId: string, @Req() req: any) {
      // Solo admin puede hacer esto en producción
      return this.multasService.generarMultaPorVencimientoManual(+prestamoId);
  } */
}
