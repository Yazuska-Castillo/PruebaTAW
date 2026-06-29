/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth.module';
import { ReserveModule } from './modules/reserve.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { LibrosModule } from './modules/libros.module';
import { PrestamosModule } from './modules/prestamos.module';
import { HistorialModule } from './modules/historial.module';
import { PrestamoModule } from './modules/prestamo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [__dirname + '/database/entities/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: false,
    }),

    AuthModule,

    LibrosModule,
    PrestamosModule,
    HistorialModule,
    ReserveModule,
    PrestamoModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
