import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { UserResponseDto } from './dto/user-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create() {
    return this.usersService.create();
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAccessGuard)
  async getMe(@Request() req): Promise<UserResponseDto> {
    const user = await this.usersService.findById(req.user.id);
    return new UserResponseDto(user);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    return new UserResponseDto(user);
  }

  @Patch('me/password')
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(
      req.user.id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  @Patch('me')
  @UseGuards(JwtAccessGuard)
  async updateMe(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.update(req.user.id, updateUserDto);
    return new UserResponseDto(updatedUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
