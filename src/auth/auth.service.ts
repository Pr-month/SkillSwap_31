import { CreateAuthDto } from './dto/create-auth.dto';
import {
  Inject,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { jwtConfig, TJwtConfig } from 'src/config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: TJwtConfig,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async login(loginDto: CreateAuthDto) {
    const { name, email } = loginDto;
    const tokens = await this.generateTokens({ name, email });
    return {
      user: { name, email },
      ...tokens,
    };
  }

  async register(registerDto: CreateAuthDto) {
    const { name, email, password } = registerDto;

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем нового пользователя
    const newUser = this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    await this.usersRepository.save(newUser);

    // Генерируем токены
    const tokens = await this.generateTokens({ name, email });

    return {
      user: { name, email },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const { name, email } = this.jwtService.verify<{
        name: string;
        email: string;
      }>(refreshToken, {
        secret: 'refresh_secret',
      });
      const tokens = await this.generateTokens({ name, email });
      return {
        accessToken: tokens.accessToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  logout(refreshToken: string): { message: string } {
    try {
      this.jwtService.verify(refreshToken, {
        secret: 'refresh_secret',
      });
      return { message: 'Logged out successfully' };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async generateTokens(payload: {
    name: string;
    email: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.accessSecret,
      expiresIn: this.config.accessExpiresIn,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.refreshSecret,
      expiresIn: this.config.refreshExpiresIn,
    });
    return { accessToken, refreshToken };
  }
}
