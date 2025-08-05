import { ModerationStatusAliasEnum } from '@/shared/enums/moderation-status.enum';
import { LanguageMap } from '@/shared/types/language-map.type';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserModerationHistoryDto {
  @IsObject()
  @IsOptional()
  observation?: LanguageMap;

  @IsEnum(ModerationStatusAliasEnum)
  @IsNotEmpty()
  moderationStatusAlias: ModerationStatusAliasEnum;
}
