import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { Categories } from './categories.data';

@Injectable()
export class CategoriesSeeder {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async seed() {
    console.log('Старт загрузки категорий...');

    // Очистка таблицы (опционально, с осторожностью в production)
    // await this.categoryRepository.clear();

    const seededCategories: Category[] = [];

    // Создаем родительские категории
    for (const categoryData of Categories) {
      // Создаем родительскую категорию
      let parentCategory = await this.categoryRepository.findOne({
        where: { name: categoryData.name, parent: IsNull() },
      });

      if (!parentCategory) {
        parentCategory = this.categoryRepository.create({
          name: categoryData.name,
          parent: null,
        });
        await this.categoryRepository.save(parentCategory);
        console.log(`Создана родительская категория: ${parentCategory.name}`);
      } else {
        console.log(`Родительская категория уже существует: ${parentCategory.name}`);
      }

      // Создаем дочерние категории
      for (const childName of categoryData.children) {
        const existingChild = await this.categoryRepository.findOne({
          where: {
            name: childName,
            parent: { id: parentCategory.id },
          },
          relations: ['parent'],
        });

        if (!existingChild) {
          const childCategory = this.categoryRepository.create({
            name: childName,
            parent: parentCategory,
          });
          await this.categoryRepository.save(childCategory);
          seededCategories.push(childCategory);
          console.log(`Создана дочерняя категория: ${childName} для ${parentCategory.name}`);
        } else {
          console.log(`Дочерняя категория уже существует: ${childName}`);
        }
      }
      
      seededCategories.push(parentCategory);
    }

    console.log(`Загрузка категорий завершена. Количество загруженных категорий: ${seededCategories.length}`);
    return seededCategories;
  }

  async clear() {
    // Внимание: это удалит все категории каскадно (благодаря onDelete: 'SET NULL')
    await this.categoryRepository.clear();
    console.log('Таблица "Категории" очищена');
  }
}