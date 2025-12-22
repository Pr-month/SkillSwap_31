import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { TRequestWithUser } from 'src/auth/auth.types';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersListResponseDto } from './dto/users-list-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query() query: GetUsersQueryDto,
  ): Promise<UsersListResponseDto> {
    const { users, total } = await this.usersService.findAll(query);
    const userDtos = users.map((user) => new UserResponseDto(user));
    return new UsersListResponseDto(
      userDtos,
      total,
      query.page || 1,
      query.limit || 20,
    );
  }

  @Get('me')
  @UseGuards(JwtAccessGuard)
  async getMe(@Request() req: TRequestWithUser): Promise<UserResponseDto> {
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
    @Request() req: TRequestWithUser,
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
    @Request() req: TRequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.update(
      req.user.id,
      updateUserDto,
    );
    return new UserResponseDto(updatedUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
