import { UserRole } from '@/modules/user-roles/schemas/user-role.schemas';
import { KeyValue } from '@/shared/schemas/key-value.schema';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { CreateUserConfigurationDto } from 'src/modules/user-configurations/dto/create-user-configuration.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsArray()
  @IsOptional()
  roles: UserRole['_id'][];

  @IsOptional()
  externalIds?: Record<string, string>;

  @IsDate()
  @IsOptional()
  userRegistrationDate?: Date;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsPositive()
  @IsOptional()
  oldId?: string;

  @Type(() => CreateUserConfigurationDto)
  @IsOptional()
  configuration?: CreateUserConfigurationDto;
}
