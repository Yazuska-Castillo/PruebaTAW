import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LibroEntity } from '../database/entities/libro.entity';
import { CreateLibroDto } from '../dto/create-libro.dto';
import { UpdateLibroDto } from '../dto/update-libro.dto';

@Injectable()
export class LibrosService {
  constructor(
    @InjectRepository(LibroEntity)
    private readonly libroRepository: Repository<LibroEntity>,
  ) {}

  async findAll() {
    return this.libroRepository.find({
      order: {
        idLibro: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const libro = await this.libroRepository.findOne({
      where: { idLibro: id },
    });

    if (!libro) {
      throw new NotFoundException('Libro no encontrado');
    }

    return libro;
  }

  async create(dto: CreateLibroDto) {
    if (dto.stockDisponible > dto.stockTotal) {
      throw new BadRequestException(
        'El stock disponible no puede ser mayor al stock total',
      );
    }

    const libro = this.libroRepository.create({
      titulo: dto.titulo,
      autor: dto.autor,
      isbn: dto.isbn,
      editorial: dto.editorial ?? null,
      categoria: dto.categoria ?? null,
      anio: dto.anio ?? null,
      descripcion: dto.descripcion ?? null,
      stockDisponible: dto.stockDisponible,
      stockTotal: dto.stockTotal,
      valorLibro: dto.valorLibro,
      estado: 1,
      ubicacionFisica: dto.ubicacionFisica ?? null,
      disponible: dto.disponible ?? dto.stockDisponible > 0,
    });

    return this.libroRepository.save(libro);
  }

  async update(id: number, dto: UpdateLibroDto) {
    const libro = await this.findOne(id);

    const nuevoStockDisponible =
      dto.stockDisponible ?? libro.stockDisponible;

    const nuevoStockTotal = dto.stockTotal ?? libro.stockTotal;

    if (nuevoStockDisponible > nuevoStockTotal) {
      throw new BadRequestException(
        'El stock disponible no puede ser mayor al stock total',
      );
    }

    Object.assign(libro, {
      titulo: dto.titulo ?? libro.titulo,
      autor: dto.autor ?? libro.autor,
      isbn: dto.isbn ?? libro.isbn,
      editorial: dto.editorial ?? libro.editorial,
      categoria: dto.categoria ?? libro.categoria,
      anio: dto.anio ?? libro.anio,
      descripcion: dto.descripcion ?? libro.descripcion,
      stockDisponible: nuevoStockDisponible,
      stockTotal: nuevoStockTotal,
      valorLibro: dto.valorLibro ?? libro.valorLibro,
      ubicacionFisica: dto.ubicacionFisica ?? libro.ubicacionFisica,
    });

    libro.disponible = libro.estado === 1 && libro.stockDisponible > 0;

    return this.libroRepository.save(libro);
  }

  async desactivar(id: number) {
    const libro = await this.findOne(id);

    libro.estado = 0;
    libro.disponible = false;

    return this.libroRepository.save(libro);
  }

  async activar(id: number) {
    const libro = await this.findOne(id);

    libro.estado = 1;
    libro.disponible = libro.stockDisponible > 0;

    return this.libroRepository.save(libro);
  }
}