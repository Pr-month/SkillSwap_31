import { CreateUserDto } from '../users/dto/create-user.dto';
import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
  Inject as NestInject,
} from '@nestjs/common';
import { jwtConfig, TJwtConfig } from 'src/config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: TJwtConfig,
    @NestInject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async login(loginDto: LoginAuthDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const tokens = await this.generateTokens({
      name: user.name,
      email: user.email,
    });

    await this.usersService['usersRepository'].update(user.id, {
      refreshToken: tokens.refreshToken,
    });

    return {
      user: { name: user.name, email: user.email },
      ...tokens,
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;

    let payload: { email: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.refreshSecret,
      });
    } catch {
      return;
    }

    const user = await this.usersService.findByEmail(payload.email);
    if (user) {
      await this.usersService['usersRepository'].update(user.id, {
        refreshToken: undefined,
      });
    }
  }

  async register(registerDto: CreateUserDto) {
    const { email, password, ...rest } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException(
        'Пользователь с таким email уже существует',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.createUser({
      ...rest,
      email,
      password: hashedPassword,
    });

    const tokens = await this.generateTokens({
      name: user.name,
      email: user.email,
    });

    return {
      user: { name: user.name, email: user.email },
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
