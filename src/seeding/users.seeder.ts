import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Users } from './users.data';
import { Gender, Role } from '../users/enum';

@Injectable()
export class UsersSeeder {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed() {
    console.log('Старт загрузки пользователей...');

    const seededUsers: User[] = [];

    for (const userData of Users) {
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        // Хэшируем пароль
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const user = this.userRepository.create({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          gender: userData.gender as Gender,
          role: 'USER' as Role,
          skills: userData.skills || [],
          favoriteSkills: userData.favoriteSkills || [],
        });

        await this.userRepository.save(user);
        seededUsers.push(user);
        console.log(`Создан пользователь: ${user.name} (${user.email})`);
      } else {
        console.log(`Пользователь уже существует: ${existingUser.email}`);
      }
    }

    console.log(`Загрузка пользователей завершена. Количество: ${seededUsers.length}`);
    return seededUsers;
  }

  async clear() {
    await this.userRepository.clear();
    console.log('Таблица "Пользователи" очищена');
  }
}