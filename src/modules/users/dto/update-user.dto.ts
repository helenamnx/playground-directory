import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateUserConfigurationDto } from 'src/modules/user-configurations/dto/update-user-configuration.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['configuration'] as const),
) {
  @IsString()
  @IsNotEmpty()
  _id: string;

  @IsDate()
  @IsOptional()
  lastLogin?: Date;

  @Type(() => UpdateUserConfigurationDto)
  @IsOptional()
  configuration?: UpdateUserConfigurationDto;
}
