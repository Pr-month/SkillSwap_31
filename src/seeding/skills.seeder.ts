import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Skill } from '../skills/entities/skill.entity';
import { Skills } from './skills.data';

@Injectable()
export class SkillsSeeder {
    constructor(
        @InjectRepository(Skill)
        private skillRepository: Repository<Skill>,
    ) {}

    async seed() {
        console.log('Старт загрузки навыков...');

        const seededSkills: Skill[] = [];

        for (const skillsData of Skills) {
        const existingSkill = await this.skillRepository.findOne({
            where: { title: skillsData.title },
        });

        if (!existingSkill) {
            
            const skill = this.skillRepository.create({
            title: skillsData.title,
            description: skillsData.description,
            images: skillsData.images || [],
            });

            await this.skillRepository.save(skill);
            seededSkills.push(skill);
            console.log(`Создан навык: ${skill.title}`);
        } else {
            console.log(`Навык уже существует: ${existingSkill.title}`);
        }
        }

        console.log(`Загрузка навыков завершена. Количество: ${seededSkills.length}`);
        return seededSkills;
    }

    async clear() {
        await this.skillRepository.clear();
        console.log('Таблица "Навыки" очищена');
    }
}