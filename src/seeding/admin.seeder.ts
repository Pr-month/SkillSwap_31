import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Gender, Role } from '../users/enum';

@Injectable()
export class AdminSeeder {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async seed() {
    console.log('Старт загрузки админа...');

    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminEmail || !adminPassword) {
      console.log('Переменные окружения ADMIN_EMAIL и ADMIN_PASSWORD не установлены. Загрузка админа пропущена.');
      return [];
    }

    const seededUsers: User[] = [];

    const existingUser = await this.userRepository.findOne({
        where: { email: adminEmail },
      });

    if (!existingUser) {
      // Хэшируем пароль
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
      const user = this.userRepository.create({
        name: 'ADMIN',
        email: adminEmail,
        password: hashedPassword,
        gender: 'male' as Gender,
        role: 'ADMIN' as Role,
        skills: [],
        favoriteSkills: [],
      });

      await this.userRepository.save(user);
      seededUsers.push(user);
      console.log(`Создан администратор: ${user.name}`);
    } else {
      console.log(`Пользователь уже существует: ${existingUser.email}`);
    }

    console.log(`Загрузка админа завершена`);
    return seededUsers;
  }

}