import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { HistorialService } from '../providers/historial.service';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';

interface RequestConUsuario extends Request {
  user: {
    id: number;
    correo: string;
    rol: string;
  };
}

@Controller('historial')
@UseGuards(JwtAuthGuard)
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @Get('mi-historial')
  obtenerMiHistorial(@Req() req: RequestConUsuario) {
    return this.historialService.obtenerMiHistorial(req.user.id);
  }

  @Get('mis-prestamos')
  obtenerMisPrestamos(@Req() req: RequestConUsuario) {
    return this.historialService.obtenerMisPrestamos(req.user.id);
  }

  @Get('mis-reservas')
  obtenerMisReservas(@Req() req: RequestConUsuario) {
    return this.historialService.obtenerMisReservas(req.user.id);
  }
}