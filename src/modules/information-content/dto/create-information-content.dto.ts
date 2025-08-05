import { LanguageMap } from '@/shared/types/language-map.type';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateInformationContentDto {
  @IsNotEmpty()
  //   @ValidateNested()
  @IsObject()
  @Type(() => Object)
  title: LanguageMap;

  @IsString()
  @IsNotEmpty()
  language: string; //this language property is used to generate the slug

  @IsOptional()
  //   @ValidateNested()
  @IsObject()
  @Type(() => Object)
  subtitle?: LanguageMap;

  @IsOptional()
  //   @ValidateNested()
  @IsObject()
  @Type(() => Object)
  body?: LanguageMap;

  @IsOptional()
  slug?: LanguageMap;
}
