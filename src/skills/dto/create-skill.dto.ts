import { IsString, IsNotEmpty, IsOptional, IsUUID, IsArray } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
