import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: 'Текущий пароль должен содержать более 6 символов' })
  oldPassword: string;

  @IsString()
  @MinLength(6, { message: 'Новый пароль должен содержать более 6 символов' })
  newPassword: string;
}
