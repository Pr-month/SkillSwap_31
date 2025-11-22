import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  constructor(
      @InjectRepository(User)
      private usersRepository: Repository<User>,
  ) {}

  create() {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'email',
        'about',
        'birthdate',
        'city',
        'gender',
        'avatar',
        'role',
      ],
    });

    //пока не включены поля skills, wantToLearn, favoriteSkills

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неправильный текущий пароль');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.usersRepository.update(userId, {
      password: hashedPassword,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.usersRepository.update(id, updateUserDto);

    return await this.findById(id);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
