import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { FindCityDto } from './dto/find-city.dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly citiesRepository: Repository<City>,
  ) {}

  // POST /cities
  async create(dto: CreateCityDto): Promise<City> {
    const city = this.citiesRepository.create(dto);
    return this.citiesRepository.save(city);
  }

  // GET /cities?search=
  async findAll(dto: FindCityDto): Promise<City[]> {
    const qb = this.citiesRepository.createQueryBuilder('city');

    if (dto.search?.trim()) {
      const search = `%${dto.search.trim()}%`;
      qb.where('city.name ILIKE :search', { search });
    }

    return qb.orderBy('city.name', 'ASC').getMany();
  }

  // PATCH /cities/:id
  async update(id: string, dto: UpdateCityDto): Promise<City> {
    const city = await this.citiesRepository.findOne({ where: { id } });
    if (!city) throw new NotFoundException('Город не найден');

    Object.assign(city, dto);
    return this.citiesRepository.save(city);
  }

  // DELETE /cities/:id
  async remove(id: string): Promise<void> {
    const result = await this.citiesRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Город не найден');
  }
}
