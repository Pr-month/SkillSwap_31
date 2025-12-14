import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  // PATCH /categories/:id
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    if (updateCategoryDto.parentId) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException(
          'Категория не может быть родителем самой себя',
        );
      }

      const isChild = category.children.some(
        (child) => child.id === updateCategoryDto.parentId,
      );
      if (isChild) {
        throw new BadRequestException(
          'Нельзя установить дочернюю категорию как родительскую',
        );
      }

      const parent = await this.categoriesRepository.findOne({
        where: { id: updateCategoryDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Родительская категория не найдена');
      }

      category.parent = parent;
    } else if (updateCategoryDto.parentId === null) {
      category.parent = null;
    }

    if (updateCategoryDto.name !== undefined) {
      category.name = updateCategoryDto.name;
    }

    return this.categoriesRepository.save(category);
  }

  // DELETE /categories/:id
  async remove(id: string): Promise<void> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    if (category.children && category.children.length > 0) {
      throw new BadRequestException(
        'Нельзя удалить категорию с дочерними элементами. ' +
        'Сначала удалите или переместите дочерние категории.',
      );
    }

    await this.categoriesRepository.remove(category);
  }
}
