import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { User } from './entities/user.entity';
import { Gender, Role } from './enum';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

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

  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    changePassword: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return users list with default pagination', async () => {
      const query: GetUsersQueryDto = {};
      mockUsersService.findAll.mockResolvedValue({
        users: mockUsers,
        total: 2,
      });

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('1');
      expect(result.data[0].name).toBe('John Doe');
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should return users list with custom pagination', async () => {
      const query: GetUsersQueryDto = { page: 2, limit: 1 };
      mockUsersService.findAll.mockResolvedValue({
        users: [mockUsers[1]],
        total: 2,
      });

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(1);
      expect(result.meta.totalPages).toBe(2);
    });

    it('should pass filters to service', async () => {
      const query: GetUsersQueryDto = {
        city: 'Moscow',
        gender: Gender.Male,
        role: Role.User,
        search: 'john',
      };
      mockUsersService.findAll.mockResolvedValue({
        users: [mockUsers[0]],
        total: 1,
      });

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should pass sorting parameters to service', async () => {
      const query: GetUsersQueryDto = {
        sortBy: 'email',
        order: 'DESC',
      };
      mockUsersService.findAll.mockResolvedValue({
        users: mockUsers,
        total: 2,
      });

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should transform users to UserResponseDto', async () => {
      const query: GetUsersQueryDto = {};
      mockUsersService.findAll.mockResolvedValue({
        users: mockUsers,
        total: 2,
      });

      const result = await controller.findAll(query);

      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('name');
      expect(result.data[0]).toHaveProperty('email');
      expect(result.data[0]).toHaveProperty('city');
      expect(result.data[0]).toHaveProperty('gender');
      expect(result.data[0]).toHaveProperty('role');
    });

    it('should return correct totalPages calculation', async () => {
      const query: GetUsersQueryDto = { page: 1, limit: 10 };
      mockUsersService.findAll.mockResolvedValue({
        users: mockUsers,
        total: 25,
      });

      const result = await controller.findAll(query);

      expect(result.meta.totalPages).toBe(3);
    });

    it('should handle empty results', async () => {
      const query: GetUsersQueryDto = { search: 'nonexistent' };
      mockUsersService.findAll.mockResolvedValue({
        users: [],
        total: 0,
      });

      const result = await controller.findAll(query);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });
  });
});
