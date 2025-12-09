import {
  IsString,
  IsOptional,
  MaxLength,
  IsArray,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];
}
