import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LibroEntity } from '../database/entities/libro.entity';
import { LibrosController } from '../controllers/libros.controller';
import { LibrosService } from '../providers/libros.service';

@Module({
  imports: [TypeOrmModule.forFeature([LibroEntity])],
  controllers: [LibrosController],
  providers: [LibrosService],
  exports: [LibrosService],
})
export class LibrosModule {}