import { LanguageMap } from '@/shared/types/language-map.type';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateCategoryScopeDto {
  @IsString()
  @IsNotEmpty()
  alias: string;

  @IsString()
  @IsOptional()
  _id?: string;

  @IsObject()
  @IsNotEmpty()
  languageMap: LanguageMap;
}
