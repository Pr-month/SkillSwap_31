import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsArray,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];
}
