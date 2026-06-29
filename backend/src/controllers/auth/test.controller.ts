import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import { RolesGuard } from '../../security/guards/roles.guard';
import { Roles } from '../../security/decorators/roles.decorator';

@Controller('test')
export class TestController {
  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  perfil(@Req() req: any) {
    return {
      mensaje: 'Token válido',
      usuario: req.user,
    };
  }

  @Get('solo-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  soloAdmin() {
    return {
      mensaje: 'Entraste como ADMIN',
    };
  }
}
