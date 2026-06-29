import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

// entidades
import { ReservaEntity } from '../database/entities/reserva.entity';
import { SalaEntity } from '../database/entities/sala.entity';
import { UsuarioEntity } from '../database/entities/usuario.entity';
import { LibroEntity } from '../database/entities/libro.entity';

// controladores
import { ReservationsController } from '../controllers/reserve/reserve.controller';

// servicios
import { ReserveRoomService } from '../providers/reserve-room.service';
import { LibraryAccessService } from '../providers/library-access.service';

@Module({
  imports: [
    // entidades
    TypeOrmModule.forFeature([
      ReservaEntity,
      SalaEntity,
      UsuarioEntity,
      LibroEntity,
    ]),

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super_secreto_hu17',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [ReservationsController],
  providers: [ReserveRoomService, LibraryAccessService],
  exports: [ReserveRoomService],
})
export class ReserveModule {}
