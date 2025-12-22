import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { Category } from '../categories/entities/category.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
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

    await this.usersRepository.update(
      { id: userId },
      {
        password: hashedPassword,
      },
    );
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, wantToLearnCategoryIds, ...rest } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      ...rest,
      email,
      password: hashedPassword,
    });

    if (wantToLearnCategoryIds && wantToLearnCategoryIds.length > 0) {
      const categories = await this.categoriesRepository.findByIds(
        wantToLearnCategoryIds,
      );
      if (categories.length !== wantToLearnCategoryIds.length) {
        throw new NotFoundException('Одна или несколько категорий не найдены');
      }
      user.wantToLearn = categories;
    }

    return await this.usersRepository.save(user);
  }

  async findAll(
    query: GetUsersQueryDto,
  ): Promise<{ users: User[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      city,
      gender,
      role,
      search,
      sortBy = 'name',
      order = 'ASC',
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    queryBuilder.select([
      'user.id',
      'user.name',
      'user.email',
      'user.about',
      'user.birthdate',
      'user.city',
      'user.gender',
      'user.avatar',
      'user.role',
    ]);

    if (city) {
      queryBuilder.andWhere('user.city = :city', { city });
    }

    if (gender) {
      queryBuilder.andWhere('user.gender = :gender', { gender });
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    const allowedSortFields = ['name', 'email', 'city', 'birthdate'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    queryBuilder.orderBy(`user.${sortField}`, order);

    queryBuilder.skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return { users, total };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('Пользователь не найден');
    }

    return await this.usersRepository.save({
      ...existingUser,
      ...updateUserDto,
    });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      refreshToken: refreshToken ?? undefined,
    });
  }
}
