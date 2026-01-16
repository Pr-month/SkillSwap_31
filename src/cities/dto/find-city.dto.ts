import { IsOptional, IsString } from 'class-validator';

export class FindCityDto {
  @IsOptional()
  @IsString()
  search?: string;
}
