import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateAppUserDto } from './create-app-user.dto';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { Type } from 'class-transformer';
import { UserRole } from '@/modules/user-roles/schemas/user-role.schemas';
import { Group } from '@/modules/groups/schemas/group.schema';

export class UpdateAppUserDto extends PartialType(
  OmitType(CreateAppUserDto, ['user'] as const),
) {
  @IsString()
  @IsNotEmpty()
  _id: string;

  @IsArray()
  @IsOptional()
  roles?: UserRole['_id'][];

  @Type(() => UpdateUserDto)
  @IsOptional()
  user?: UpdateUserDto;

  @IsArray()
  @IsOptional()
  groups?: Group['_id'][];
}
