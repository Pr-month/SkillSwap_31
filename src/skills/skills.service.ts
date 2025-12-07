import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import { FindSkillsDto } from './dto/find-skills.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SkillsService {
  private uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads');
  constructor(
    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  //создание навыка
  async create(createSkillDto: CreateSkillDto, owner: User): Promise<Skill> {
    const category = await this.categoriesRepository.findOne({
      where: { id: createSkillDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Категория с ID "${createSkillDto.categoryId}" не найдена.`,
      );
    }

    const skill = this.skillsRepository.create({
      ...createSkillDto,
      category,
      owner,
    });

    return await this.skillsRepository.save(skill);
  }

  //получение списка навыков
  async findAll(findSkillsDto: FindSkillsDto) {
    const { page, limit, search, category } = findSkillsDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.skillsRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('category.parent', 'parent');

    if (category) {
      queryBuilder.andWhere('category.id = :categoryId', {
        categoryId: category,
      });
    }

    if (search) {
      const searchLike = `%${search.toLowerCase()}%`;
      queryBuilder.andWhere(
        `(LOWER(skill.title) LIKE :search OR LOWER(category.name) LIKE :search OR LOWER(parent.name) LIKE :search)`,
        { search: searchLike },
      );
    }

    const [skills, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    if (page > totalPages && total > 0) {
      throw new NotFoundException(
        `Page ${page} does not exist. Total pages: ${totalPages}`,
      );
    }

    return {
      data: skills,
      page,
      totalPages,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} skill`;
  }

  async update(
    id: string,
    updateSkillDto: UpdateSkillDto,
    userId: string,
  ): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!skill) {
      throw new NotFoundException(`Навык с ID "${id}" не найден.`);
    }

    if (skill.owner.id !== userId) {
      throw new ForbiddenException('Нет доступа.');
    }

    if (updateSkillDto.categoryId !== undefined) {
      const category = await this.categoriesRepository.findOne({
        where: { id: updateSkillDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Категория с ID "${updateSkillDto.categoryId}" не найдена.`,
        );
      }
    }

    await this.skillsRepository.update(id, updateSkillDto);

    const updatedSkill = await this.skillsRepository.findOne({
      where: { id },
      relations: ['owner', 'category'],
    });

    if (!updatedSkill) {
      throw new NotFoundException(`Навык с ID "${id}" не найден.`);
    }

    return updatedSkill;
  }

  //удаление навыка
  async remove(id: string, userId: string): Promise<void> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!skill) {
      throw new NotFoundException(`Навык с ID "${id}" не найден.`);
    }

    if (skill.owner.id !== userId) {
      throw new ForbiddenException('Нет доступа.');
    }

    if (skill.images && skill.images.length > 0) {
      for (const imageUrl of skill.images) {
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
          const filePath = path.join(this.uploadPath, fileName);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
    }

    await this.skillsRepository.delete(id);
  }

  //добавление навыка в избранное
  async addToFavorites(skillId: string, userEmail: string): Promise<void> {
    const skill = await this.skillsRepository.findOne({
      where: { id: skillId },
      relations: ['favoritedBy'],
    });

    if (!skill) {
      throw new NotFoundException('Навык не найден');
    }

    const user = await this.usersRepository.findOne({
      where: { email: userEmail },
      relations: ['favoriteSkills'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isAlreadyFavorite = user.favoriteSkills.some(
      (favSkill) => favSkill.id === skillId,
    );

    if (isAlreadyFavorite) {
      throw new ConflictException('Навык уже добавлен в избранное');
    }

    user.favoriteSkills.push(skill);
    await this.usersRepository.save(user);
  }
}
