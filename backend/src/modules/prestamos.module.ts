import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PrestamoEntity } from '../database/entities/prestamo.entity';
import { LibroEntity } from '../database/entities/libro.entity';
import { PrestamosController } from '../controllers/prestamos.controller';
import { PrestamosService } from '../providers/prestamos.service';

@Module({
  imports: [TypeOrmModule.forFeature([PrestamoEntity, LibroEntity])],
  controllers: [PrestamosController],
  providers: [PrestamosService],
  exports: [PrestamosService],
})
export class PrestamosModule {}