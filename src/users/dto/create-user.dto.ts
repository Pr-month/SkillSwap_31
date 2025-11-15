import {
    IsEmail,
    IsString,
    IsOptional,
    MinLength,
    MaxLength,
    IsEnum,
    IsDate,
    IsUrl
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    about?: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    birthdate?: Date;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    city?: string;

    @IsOptional()
    @IsEnum(['male', 'female', 'unspecified'])
    gender?: 'male' | 'female' | 'unspecified';

    @IsOptional()
    @IsUrl()
    avatar?: string;

    @IsOptional()
    @IsEnum(['USER', 'ADMIN'])
    role?: 'USER' | 'ADMIN';
}