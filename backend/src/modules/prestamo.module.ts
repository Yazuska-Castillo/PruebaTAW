import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrestamoController } from '../controllers/prestamos/prestamo.controller';
import { PrestamoService } from '../providers/prestamo.service';
import { PrestamoEntity } from '../database/entities/prestamo.entity';
import { LibroEntity } from '../database/entities/libro.entity';
import { UsuarioEntity } from '../database/entities/usuario.entity';
import { LibraryAccessService } from '../providers/library-access.service';
import { ReservaEntity } from '../database/entities/reserva.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PrestamoEntity,
      LibroEntity,
      UsuarioEntity,
      ReservaEntity,
    ]),
  ],
  controllers: [PrestamoController],
  providers: [PrestamoService, LibraryAccessService],
  exports: [PrestamoService],
})
export class PrestamoModule {}
