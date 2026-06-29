import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import { PrestamoService } from '../../providers/prestamo.service';
import { SolicitarPrestamoDto } from '../../dto/solicitar-prestamo.dto';

@Controller('prestamos')
export class PrestamoController {
  constructor(private readonly prestamoService: PrestamoService) {}

  @UseGuards(JwtAuthGuard)
  @Post('solicitar')
  async solicitarPrestamo(
    @Req() req: any,
    @Body() solicitarPrestamoDto: SolicitarPrestamoDto,
  ) {
    const prestamo = await this.prestamoService.solicitarPrestamo(
      req.user.id,
      solicitarPrestamoDto.idLibro,
    );

    return {
      message: 'Préstamo solicitado exitosamente',
      prestamo: {
        idPrestamo: prestamo.idPrestamo,
        fechaPrestamo: prestamo.fechaPrestamo,
        fechaDevolucionEsperada: prestamo.fechaDevolucionEsperada,
        estado: prestamo.estado,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/devolver')
  async devolverPrestamo(
    @Req() req: any,
    @Param('id', ParseIntPipe) idPrestamo: number,
  ) {
    const prestamo = await this.prestamoService.devolverPrestamo(
      req.user.id,
      idPrestamo,
    );

    return {
      message: 'Libro devuelto exitosamente',
      prestamo: {
        idPrestamo: prestamo.idPrestamo,
        fechaDevolucionReal: prestamo.fechaDevolucionReal,
        estado: prestamo.estado,
      },
    };
  }
}
