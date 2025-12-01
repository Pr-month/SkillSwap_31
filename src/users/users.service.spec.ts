import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Gender, Role } from './enum';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let queryBuilder: Partial<SelectQueryBuilder<User>>;

  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      about: 'About John',
      birthdate: new Date('1990-01-01'),
      city: 'Moscow',
      gender: Gender.Male,
      avatar: 'avatar1.jpg',
      role: Role.User,
      refreshToken: undefined,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'hashed_password',
      about: 'About Jane',
      birthdate: new Date('1992-05-15'),
      city: 'Saint Petersburg',
      gender: Gender.Female,
      avatar: 'avatar2.jpg',
      role: Role.Admin,
      refreshToken: undefined,
    },
  ];

  beforeEach(async () => {
    queryBuilder = {
      select: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([mockUsers, 2]),
    };

    const mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return users with default pagination', async () => {
      const query: GetUsersQueryDto = {};
      const result = await service.findAll(query);

      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(2);
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(20);
    });

    it('should apply pagination correctly', async () => {
      const query: GetUsersQueryDto = { page: 2, limit: 10 };
      await service.findAll(query);

      expect(queryBuilder.skip).toHaveBeenCalledWith(10);
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should filter by city', async () => {
      const query: GetUsersQueryDto = { city: 'Moscow' };
      await service.findAll(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('user.city = :city', {
        city: 'Moscow',
      });
    });

    it('should filter by gender', async () => {
      const query: GetUsersQueryDto = { gender: Gender.Male };
      await service.findAll(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'user.gender = :gender',
        { gender: Gender.Male },
      );
    });

    it('should filter by role', async () => {
      const query: GetUsersQueryDto = { role: Role.Admin };
      await service.findAll(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('user.role = :role', {
        role: Role.Admin,
      });
    });

    it('should search by name or email', async () => {
      const query: GetUsersQueryDto = { search: 'john' };
      await service.findAll(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: '%john%' },
      );
    });

    it('should sort by name ASC by default', async () => {
      const query: GetUsersQueryDto = {};
      await service.findAll(query);

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('user.name', 'ASC');
    });

    it('should sort by specified field and order', async () => {
      const query: GetUsersQueryDto = { sortBy: 'email', order: 'DESC' };
      await service.findAll(query);

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('user.email', 'DESC');
    });

    it('should use default sort field if invalid sortBy provided', async () => {
      const query: GetUsersQueryDto = {
        sortBy: 'invalidField',
        order: 'ASC',
      };
      await service.findAll(query);

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('user.name', 'ASC');
    });

    it('should apply multiple filters together', async () => {
      const query: GetUsersQueryDto = {
        city: 'Moscow',
        gender: Gender.Male,
        role: Role.User,
        search: 'john',
        page: 1,
        limit: 10,
        sortBy: 'email',
        order: 'DESC',
      };
      await service.findAll(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('user.city = :city', {
        city: 'Moscow',
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'user.gender = :gender',
        { gender: Gender.Male },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('user.role = :role', {
        role: Role.User,
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: '%john%' },
      );
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('user.email', 'DESC');
    });

    it('should select only public user fields', async () => {
      const query: GetUsersQueryDto = {};
      await service.findAll(query);

      expect(queryBuilder.select).toHaveBeenCalledWith([
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
    });
  });
});
