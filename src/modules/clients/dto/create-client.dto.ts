import { CreateClientConfigurationDto } from '@/modules/client-configurations/dto/create-client-configuration.dto';
import { CreateContactPointDto } from '@/modules/contact-points/dto/create-contact-point.dto';
import { CreateInformationDto } from '@/modules/information/dto/create-information.dto';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  baseURL: string;

  @IsString()
  @IsNotEmpty()
  alias: string;

  @IsString()
  @IsOptional()
  externalPlatformId?: string;

  externalIds: Record<string, string>;

  @IsString()
  @IsNotEmpty()
  technology: string;

  @IsString()
  @IsNotEmpty()
  tenant: string;

  @ValidateNested()
  @Type(() => CreateClientConfigurationDto)
  configuration: CreateClientConfigurationDto;

  @IsOptional()
  organization?: string;

  @IsArray()
  @IsOptional()
  @Type(() => CreateInformationDto)
  information?: CreateInformationDto[];

  @IsArray()
  @IsOptional()
  @Type(() => CreateContactPointDto)
  contactPoints?: CreateContactPointDto[];
}
