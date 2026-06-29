import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { PrestamosService } from '../providers/prestamos.service';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RolesGuard } from '../security/guards/roles.guard';
import { Roles } from '../security/decorators/roles.decorator';

@Controller('prestamos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrestamosController {
  constructor(private readonly prestamosService: PrestamosService) {}

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.prestamosService.findAll();
  }

  @Get('atrasados')
  @Roles('ADMIN')
  listarAtrasados() {
    return this.prestamosService.listarAtrasados();
  }

  @Patch('actualizar-atrasados')
  @Roles('ADMIN')
  marcarAtrasados() {
    return this.prestamosService.marcarAtrasados();
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.prestamosService.findOne(id);
  }

  @Get(':id/fechas')
  @Roles('ADMIN')
  obtenerFechas(@Param('id', ParseIntPipe) id: number) {
    return this.prestamosService.obtenerFechas(id);
  }

  @Patch(':id/entregar')
  @Roles('ADMIN')
  marcarComoEntregado(@Param('id', ParseIntPipe) id: number) {
    return this.prestamosService.marcarComoEntregado(id);
  }

  @Patch(':id/finalizar')
  @Roles('ADMIN')
  finalizarPrestamo(@Param('id', ParseIntPipe) id: number) {
    return this.prestamosService.finalizarPrestamo(id);
  }
}