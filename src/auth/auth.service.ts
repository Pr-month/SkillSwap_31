import { CreateUserDto } from '../users/dto/create-user.dto';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConfig, TJwtConfig } from 'src/config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { TJwtPayload } from './auth.types';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: TJwtConfig,
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
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

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

    const user = await this.usersService.findByEmail(payload.email);
    if (user) {
      await this.usersService.updateRefreshToken(user.id, null);
    }
  }

  async register(registerDto: CreateUserDto) {
    const user = await this.usersService.create(registerDto);

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

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<TJwtPayload>(refreshToken, {
        secret: this.config.refreshSecret,
      });

      const tokens = await this.generateTokens(payload);

      return {
        accessToken: tokens.accessToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
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
