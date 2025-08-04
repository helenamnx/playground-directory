import { CreateClientConfigurationDto } from '@/modules/client-configurations/dto/create-client-configuration.dto';
import { KeyValue } from '@/shared/schemas/key-value.schema';
import { Prop } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
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

  externalIds: KeyValue[];

  @IsString()
  @IsNotEmpty()
  technology: string;

  @IsString()
  @IsNotEmpty()
  tenant: string;

  @ValidateNested()
  @Type(() => CreateClientConfigurationDto)
  configuration: CreateClientConfigurationDto;
}
