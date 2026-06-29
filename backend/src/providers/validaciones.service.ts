import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioEntity } from '../database/entities/usuario.entity';

@Injectable()
export class ValidacionesService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
  ) {}

  async validarEstadoAcademico(usuario: any): Promise<boolean> {
    const usuarioActual = await this.usuarioRepository.findOne({
      where: { idUsuario: usuario.idUsuario },
    });

    if (!usuarioActual) {
      throw new ForbiddenException('Usuario no encontrado');
    }
    const estudianteActivo = usuarioActual.estadoAcademico === 'activo';

    if (!estudianteActivo) {
      throw new ForbiddenException(
        'El estudiante no tiene estado académico activo',
      );
    }

    if (usuarioActual.tieneMultaImpaga) {
      throw new ForbiddenException(
        'No puedes realizar préstamos porque tienes multas pendientes. Regulariza tu situación para continuar.',
      );
    }

    return estudianteActivo;
  }

  async actualizarEstadoAcademicoDesdeApi(rut: string): Promise<void> {
    const estadoReal = await this.consultarApiEstadoAcademico(rut);

    await this.usuarioRepository.update(
      { rut },
      { estadoAcademico: estadoReal ? 'activo' : 'inactivo' },
    );
  }

  private async consultarApiEstadoAcademico(rut: string): Promise<boolean> {
    // Implementar llamada real a API externa
    // Por ahora retorna true simulando estudiante activo
    return true;
  }
}
