import { Type } from 'class-transformer';
import { Gender, Role } from '../enum';
import { User } from '../entities/user.entity';

export class UserResponseDto {
    name: string;
    email: string;
    about?: string;
    @Type(() => Date)
    birthdate?: Date;
    city?: string;
    gender?: Gender;
    avatar?: string;
    role?: Role;

    constructor(partial: User) {
        Object.assign(this, partial);
    }
}