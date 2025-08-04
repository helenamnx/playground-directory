import { KeyValue } from '@/shared/schemas/key-value.schema';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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
  roles: string[];

  @IsArray()
  @IsOptional()
  externalIds?: KeyValue[];

  @Type(() => CreateUserConfigurationDto)
  @IsOptional()
  configuration?: CreateUserConfigurationDto;
}
