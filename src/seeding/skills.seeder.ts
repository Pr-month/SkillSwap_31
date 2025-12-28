import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Skills } from './skills.data';

@Injectable()
export class SkillsSeeder {
    private readonly logger = new Logger(SkillsSeeder.name);

    constructor(
        @InjectRepository(Skill)
        private skillRepository: Repository<Skill>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) {}

    async seed() {
        this.logger.log('Старт загрузки навыков...');

        const users = await this.userRepository.find({ take: 5 });
        const categories = await this.categoryRepository.find({ take: 5 });

        if (users.length === 0) {
        this.logger.error('Нет пользователей в БД — невозможно создать навыки');
        return [];
        }
        if (categories.length === 0) {
        this.logger.error('Нет категорий в БД — невозможно создать навыки');
        return [];
        }

        const seededSkills: Skill[] = [];

        for (let i = 0; i < Skills.length; i++) {
        const skillData = Skills[i];

        const existingSkill = await this.skillRepository.findOne({
            where: { title: skillData.title },
        });

        if (existingSkill) {
            this.logger.warn(`Навык уже существует: ${existingSkill.title}`);
            continue;
        }

        const owner = users[i % users.length];
        const category = categories[i % categories.length];

        const skill = this.skillRepository.create({
            title: skillData.title,
            description: skillData.description,
            images: skillData.images || [],
            owner,
            category,
        });

        const savedSkill = await this.skillRepository.save(skill);
        seededSkills.push(savedSkill);
        this.logger.log(`Создан навык: ${savedSkill.title} (владелец: ${owner.id}, категория: ${category.id})`);
        }

        this.logger.log(`Загрузка навыков завершена. Количество: ${seededSkills.length}`);
        return seededSkills;
    }

    async clear() {
        await this.skillRepository.clear();
        this.logger.log('Таблица "Навыки" очищена');
    }
}