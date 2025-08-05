import { CreateClientConfigurationDto } from '@/modules/client-configurations/dto/create-client-configuration.dto';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AssingClientToPlatformDto {
  @IsString()
  @IsNotEmpty()
  baseURL: string;

  @IsString()
  @IsNotEmpty()
  externalPlatformId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  alias: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateClientConfigurationDto)
  configuration: CreateClientConfigurationDto;

  @IsOptional()
  organization?: string;
}
