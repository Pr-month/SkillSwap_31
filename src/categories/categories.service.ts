import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { IsNull, Repository } from 'typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  //  POST /categories
  async create(dto: CreateCategoryDto): Promise<Category> {
    let parent: Category | null = null;

    if (dto.parentId) {
      parent = await this.categoriesRepository.findOne({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Родительская категория не найдена');
      }
    }

    const category = this.categoriesRepository.create({
      name: dto.name,
      parent: parent ?? null,
    });

    return this.categoriesRepository.save(category);
  }

  //  GET /categories
  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { parent: IsNull() },
      relations: ['children'],
      order: {
        name: 'ASC',
        children: {
          name: 'ASC',
        },
      },
    });
  }

  async findOne(id: string): Promise<Category | null> {
    return this.categoriesRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: string, _updateCategoryDto: UpdateCategoryDto): string {
    return `This action updates a #${id} category`;
  }

  remove(id: string): string {
    return `This action removes a #${id} category`;
  }
}
