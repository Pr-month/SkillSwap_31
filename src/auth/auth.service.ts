import { CreateAuthDto } from './dto/create-auth.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(loginDto: CreateAuthDto) {
    const { name, email } = loginDto;
    return {
      user: { name, email },
      accessToken: this.jwtService.sign(
        { name, email },
        {
          secret: 'access_secret',
          expiresIn: '1h',
        },
      ),
      refreshToken: this.jwtService.sign(
        { name, email },
        {
          secret: 'refresh_secret',
          expiresIn: '7d',
        },
      ),
    };
  }

  register(registerDto: CreateAuthDto) {
    const { name, email } = registerDto;
    return {
      user: { name, email },
      accessToken: this.jwtService.sign(
        { name, email },
        {
          secret: 'access_secret',
          expiresIn: '1h',
        },
      ),
      refreshToken: this.jwtService.sign(
        { name, email },
        {
          secret: 'refresh_secret',
          expiresIn: '7d',
        },
      ),
    };
  }

  refresh(refreshToken: string) {
    try {
      const { name, email } = this.jwtService.verify<{
        name: string;
        email: string;
      }>(refreshToken, {
        secret: 'refresh_secret',
      });
      return {
        accessToken: this.jwtService.sign(
          { name, email },
          {
            secret: 'access_secret',
            expiresIn: '1h',
          },
        ),
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  logout(refreshToken: string) {
    try {
      this.jwtService.verify(refreshToken, { secret: 'refresh_secret' });
      return { message: 'Logged out successfully' };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
