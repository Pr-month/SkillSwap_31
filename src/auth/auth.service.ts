import { CreateUserDto } from '../users/dto/create-user.dto';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { jwtConfig, TJwtConfig } from 'src/config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { TJwtPayload } from './auth.types';
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
    private readonly usersRepository: Repository<User>,
  ) {}

  async login(loginDto: LoginAuthDto) {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const tokens = await this.generateTokens({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    await this.usersRepository.update(user.id, {
      refreshToken: tokens.refreshToken,
    });

    return {
      user: { name: user.name, email: user.email },
      ...tokens,
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;

    let payload: TJwtPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.refreshSecret,
      });
    } catch {
      return;
    }

    const user = await this.usersRepository.findOne({
      where: { email: payload.email },
    });
    if (user) {
      await this.usersRepository.update(user.id, {
        refreshToken: undefined,
      });
    }
  }

  async register(registerDto: CreateUserDto) {
    const { email, password, ...rest } = registerDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException(
        'Пользователь с таким email уже существует',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      ...rest,
      email,
      password: hashedPassword,
    });
    await this.usersRepository.save(user);

    const tokens = await this.generateTokens({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return {
      user: { name: user.name, email: user.email },
      ...tokens,
    };
  }

  async refresh(payload: TJwtPayload) {
    const tokens = await this.generateTokens(payload);

    return {
      accessToken: tokens.accessToken,
    };
  }

  private async generateTokens(
    payload: TJwtPayload,
  ): Promise<{ accessToken: string; refreshToken: string }> {
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
