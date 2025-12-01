import { UserResponseDto } from './user-response.dto';

export class UsersListResponseDto {
  data: UserResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(
    users: UserResponseDto[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.data = users;
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
