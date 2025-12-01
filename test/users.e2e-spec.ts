import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Gender, Role } from '../src/users/enum';
import * as bcrypt from 'bcrypt';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const testUsers = [
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'password123',
      city: 'Moscow',
      gender: Gender.Female,
      role: Role.User,
      about: 'Test user Alice',
    },
    {
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: 'password123',
      city: 'Saint Petersburg',
      gender: Gender.Male,
      role: Role.User,
      about: 'Test user Bob',
    },
    {
      name: 'Charlie Admin',
      email: 'charlie@example.com',
      password: 'password123',
      city: 'Moscow',
      gender: Gender.Male,
      role: Role.Admin,
      about: 'Test admin Charlie',
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Очищаем таблицу пользователей перед тестами
    await dataSource.getRepository(User).clear();

    // Создаем тестовых пользователей
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = testUsers.map((user) => ({
      ...user,
      password: hashedPassword,
    }));

    await dataSource.getRepository(User).save(users);
  });

  afterAll(async () => {
    // Очищаем таблицу после тестов
    await dataSource.getRepository(User).clear();
    await app.close();
  });

  describe('GET /users', () => {
    it('should return users list with default pagination', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('limit');
          expect(res.body.meta).toHaveProperty('totalPages');
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(20);
          expect(res.body.data.length).toBe(3);
        });
    });

    it('should apply pagination correctly', () => {
      return request(app.getHttpServer())
        .get('/users?page=2&limit=2')
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.page).toBe(2);
          expect(res.body.meta.limit).toBe(2);
          expect(res.body.meta.total).toBe(3);
          expect(res.body.data.length).toBe(1);
        });
    });

    it('should filter by city', () => {
      return request(app.getHttpServer())
        .get('/users?city=Moscow')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(2);
          res.body.data.forEach((user: User) => {
            expect(user.city).toBe('Moscow');
          });
        });
    });

    it('should filter by gender', () => {
      return request(app.getHttpServer())
        .get('/users?gender=male')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(2);
          res.body.data.forEach((user: User) => {
            expect(user.gender).toBe(Gender.Male);
          });
        });
    });

    it('should filter by role', () => {
      return request(app.getHttpServer())
        .get('/users?role=ADMIN')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(1);
          expect(res.body.data[0].role).toBe(Role.Admin);
        });
    });

    it('should search by name', () => {
      return request(app.getHttpServer())
        .get('/users?search=alice')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(1);
          expect(res.body.data[0].name).toBe('Alice Johnson');
        });
    });

    it('should search by email', () => {
      return request(app.getHttpServer())
        .get('/users?search=bob@example.com')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(1);
          expect(res.body.data[0].email).toBe('bob@example.com');
        });
    });

    it('should sort by name in ascending order', () => {
      return request(app.getHttpServer())
        .get('/users?sortBy=name&order=ASC')
        .expect(200)
        .expect((res) => {
          expect(res.body.data[0].name).toBe('Alice Johnson');
          expect(res.body.data[1].name).toBe('Bob Smith');
          expect(res.body.data[2].name).toBe('Charlie Admin');
        });
    });

    it('should sort by name in descending order', () => {
      return request(app.getHttpServer())
        .get('/users?sortBy=name&order=DESC')
        .expect(200)
        .expect((res) => {
          expect(res.body.data[0].name).toBe('Charlie Admin');
          expect(res.body.data[1].name).toBe('Bob Smith');
          expect(res.body.data[2].name).toBe('Alice Johnson');
        });
    });

    it('should combine multiple filters', () => {
      return request(app.getHttpServer())
        .get('/users?city=Moscow&gender=male')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(1);
          expect(res.body.data[0].name).toBe('Charlie Admin');
          expect(res.body.data[0].city).toBe('Moscow');
          expect(res.body.data[0].gender).toBe(Gender.Male);
        });
    });

    it('should not return password field', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          res.body.data.forEach((user: User) => {
            expect(user).not.toHaveProperty('password');
          });
        });
    });

    it('should not return refreshToken field', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          res.body.data.forEach((user: User) => {
            expect(user).not.toHaveProperty('refreshToken');
          });
        });
    });

    it('should return user with all public fields', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          const user = res.body.data[0];
          expect(user).toHaveProperty('id');
          expect(user).toHaveProperty('name');
          expect(user).toHaveProperty('email');
          expect(user).toHaveProperty('city');
          expect(user).toHaveProperty('gender');
          expect(user).toHaveProperty('role');
        });
    });

    it('should return 400 for invalid page parameter', () => {
      return request(app.getHttpServer()).get('/users?page=0').expect(400);
    });

    it('should return 400 for invalid limit parameter', () => {
      return request(app.getHttpServer()).get('/users?limit=-1').expect(400);
    });

    it('should return empty array when no users match filters', () => {
      return request(app.getHttpServer())
        .get('/users?search=nonexistent')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toEqual([]);
          expect(res.body.meta.total).toBe(0);
        });
    });

    it('should calculate totalPages correctly', () => {
      return request(app.getHttpServer())
        .get('/users?limit=2')
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.total).toBe(3);
          expect(res.body.meta.limit).toBe(2);
          expect(res.body.meta.totalPages).toBe(2);
        });
    });
  });
});
