import { LanguageMapType } from '@/shared/types/language-map.type';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateExamAttemptStatusDto {
  @IsString()
  @IsNotEmpty()
  value: string;
}
