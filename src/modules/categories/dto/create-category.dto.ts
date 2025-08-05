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
import { Category } from '../schemas/category.schema';
import { CategoryScope } from '@/modules/category-scopes/schemas/category-scope.schema';

export class CreateCategoryDto {
  @IsOptional()
  @IsString()
  code?: string;

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
  @IsArray()
  @Type(() => String)
  tags?: Tag[];
}
