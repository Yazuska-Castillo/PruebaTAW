import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard';

import { ValidacionesService } from 'src/providers/validaciones.service';

@ApiTags('Validaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('validaciones')
export class ValidacionesController {
  constructor(private readonly validacionesService: ValidacionesService) {}

  @Get('estado-academico')
  @ApiOperation({ summary: 'Validar estado academico ' })
  async validarEstadoAcademico(@Req() req: any) {
    const usuario = req.user;
    const estudianteActivo =
      await this.validacionesService.validarEstadoAcademico(usuario);
    return {
      success: true,
      message: 'validación Academica',
      data: {
        usuario,
        estudianteActivo,
      },
    };
  }
}
