import { IsEnum } from 'class-validator';
import { RequestStatus } from '../enum';

export class UpdateRequestDto {
  @IsEnum(RequestStatus, {
    message: 'status must be one of: accepted, rejected',
  })
  status: RequestStatus;
}
