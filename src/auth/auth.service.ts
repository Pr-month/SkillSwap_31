import { CreateAuthDto } from './dto/create-auth.dto';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConfig, TJwtConfig } from 'src/config/jwt.config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: TJwtConfig,
  ) {}

  async login(loginDto: CreateAuthDto) {
    const { name, email } = loginDto;
    const tokens = await this.generateTokens({ name, email });
    return {
      user: { name, email },
      ...tokens,
    };
  }

  async logout(refreshToken: string) {}

  async register(registerDto: CreateAuthDto) {
    const { name, email } = registerDto;
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
