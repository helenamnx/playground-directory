import { LanguageMap, LanguageMapType } from '@/shared/types/language-map.type';
import { Tag } from '@/tags/entities/tag.entity';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsArray,
  IsString,
  IsNotEmpty,
  IsBoolean,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { CategoryScope } from '@/modules/category-scopes/schemas/category-scope.schema';
import { Category } from '@/modules/categories/schemas/category.schema';
import { CreateExamConfigurationDto } from '@/modules/exam-configurations/dto/create-exam-configuration.dto';

export class CreateExamTypeDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsBoolean()
  highlighted?: boolean;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsArray()
  @Type(() => String)
  parentCategories?: Category[];

  @IsNotEmpty()
  @IsString()
  scope: CategoryScope['_id'];

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsNotEmpty()
  @ValidateNested()
  @IsObject()
  @Type(() => Object)
  title: LanguageMap;

  @IsOptional()
  @ValidateNested()
  @IsObject()
  @Type(() => Object)
  description?: LanguageMap;

  @IsOptional()
  @Type(() => CreateExamConfigurationDto)
  configuration?: CreateExamConfigurationDto;
}
