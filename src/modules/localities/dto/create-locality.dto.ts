import { LanguageMap } from '@/shared/types/language-map.type';
import { IsNotEmpty, IsObject } from 'class-validator';

export class CreateLocalityDto {
  @IsObject()
  @IsNotEmpty()
  value: LanguageMap;
}
