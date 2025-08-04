import { CreateClientConfigurationDto } from '@/modules/client-configurations/dto/create-client-configuration.dto';
import { CreateServiceConfigurationDto } from '@/modules/service-configurations/dto/create-service-configuration.dto';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsBoolean,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty()
  @IsUrl()
  baseURL: string;

  @IsNotEmpty()
  @IsString()
  alias: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  externalPlatformId?: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateServiceConfigurationDto)
  configuration: CreateServiceConfigurationDto;
}
