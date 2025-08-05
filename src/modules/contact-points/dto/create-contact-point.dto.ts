import { LanguageMap } from '@/shared/types/language-map.type';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateContactPointDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @IsObject()
  @IsOptional()
  name?: LanguageMap;
}
