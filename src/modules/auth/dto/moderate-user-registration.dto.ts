import { AppUser } from '@/modules/app-users/schemas/app-user.schema';
import { Group } from '@/modules/groups/schemas/group.schema';
import { UserRole } from '@/modules/user-roles/schemas/user-role.schemas';
import { ModerationStatusAliasEnum } from '@/shared/enums/moderation-status.enum';
import { LanguageMap } from '@/shared/types/language-map.type';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class ModerateUserRegistrationDto {
  @IsString()
  @IsNotEmpty()
  appUserId: AppUser['_id'];

  @IsEnum(ModerationStatusAliasEnum)
  @IsNotEmpty()
  status: ModerationStatusAliasEnum;

  @IsObject()
  @IsOptional()
  observation?: LanguageMap;

  @IsArray()
  @IsOptional()
  roles?: UserRole['_id'][];

  @IsArray()
  @IsOptional()
  groups?: Group['_id'][];
}
