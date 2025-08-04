import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { Platform } from '../schemas/platform.schema';

export class ServiceForPlatformDto {
  @IsString()
  @IsNotEmpty()
  _id: Platform['_id'];

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  alias: string;

  @IsOptional()
  @IsString()
  baseURL: string;

  @IsObject()
  @IsNotEmpty()
  configuration: any; //TODO: add dto and validations
}

export class ClientForPlatformDto extends ServiceForPlatformDto {}

export class UpsertServiceForPlatformDto {
  @IsNotEmpty()
  @Type(() => ServiceForPlatformDto)
  service: ServiceForPlatformDto;

  @IsNotEmpty()
  @Type(() => ClientForPlatformDto)
  client: ClientForPlatformDto;
}
