import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateAppUserDto } from './create-app-user.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { Type } from 'class-transformer';

export class UpdateAppUserDto extends PartialType(
  OmitType(CreateAppUserDto, ['user'] as const),
) {
  @IsString()
  @IsNotEmpty()
  _id: string;

  @Type(() => UpdateUserDto)
  @IsOptional()
  user?: UpdateUserDto;
}
