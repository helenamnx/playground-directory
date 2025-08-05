import { LanguageMapType } from '@/shared/types/language-map.type';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateModerationStatusDto {
  @IsNotEmpty()
  status: LanguageMapType;

  @IsString()
  @IsNotEmpty()
  alias: string;
}
