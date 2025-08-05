import { LanguageMap } from '@/shared/types/language-map.type';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsBoolean,
  ValidateNested,
  IsObject,
  IsOptional,
} from 'class-validator';

export class CreateAnswerOptionDto {
  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;

  @IsObject()
  @IsOptional()
  justification?: LanguageMap;

  @IsNotEmpty()
  @ValidateNested()
  @IsObject()
  @Type(() => Object)
  value: LanguageMap;
}
