import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HistorialController } from '../controllers/historial.controller';
import { HistorialService } from '../providers/historial.service';
import { PrestamoEntity } from '../database/entities/prestamo.entity';
import { ReservaEntity } from '../database/entities/reserva.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PrestamoEntity, ReservaEntity])],
  controllers: [HistorialController],
  providers: [HistorialService],
})
export class HistorialModule {}