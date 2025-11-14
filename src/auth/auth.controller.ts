import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: CreateAuthDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }
}
