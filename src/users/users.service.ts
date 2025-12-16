import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  create() {
    return 'This action adds a new user';
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

    await this.usersRepository.update({ id: userId }, {
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

    return await this.usersRepository.save({
      ...existingUser,
      ...updateUserDto
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
