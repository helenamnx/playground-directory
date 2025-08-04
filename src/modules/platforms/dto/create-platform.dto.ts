import { CreatePlatformConfigurationDto } from '@/modules/platform-configurations/dto/create-platform.dto';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class CreatePlatformDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  clients: string[];

  @IsArray()
  @IsString({ each: true })
  services: string[];

  @IsUrl()
  @IsNotEmpty()
  baseURL: string;

  @ValidateNested()
  @Type(() => CreatePlatformConfigurationDto)
  configuration: CreatePlatformConfigurationDto;

  @IsString()
  @IsNotEmpty()
  technology: string;

  @IsString()
  @IsNotEmpty()
  tenant: string;
}
