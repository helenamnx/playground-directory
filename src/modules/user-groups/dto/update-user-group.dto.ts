import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { AppUser } from '@/modules/app-users/schemas/app-user.schema';
import { Group } from '@/modules/groups/schemas/group.schema';
import { Body } from '@nestjs/common';
import { Type } from 'class-transformer';

export enum UpdateUserGroupsActionsEnum {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

export class UpdateUsersGroupDto {
  @IsString()
  @IsNotEmpty()
  groupId: Group['_id'];

  @IsArray()
  @ArrayMinSize(1)
  appUserIds: AppUser['_id'][];

  @IsEnum(UpdateUserGroupsActionsEnum)
  @IsNotEmpty()
  action: UpdateUserGroupsActionsEnum;
}
