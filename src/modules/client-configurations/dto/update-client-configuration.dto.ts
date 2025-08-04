import { PartialType } from '@nestjs/mapped-types';
import { CreateClientConfigurationDto } from './create-client-configuration.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateClientConfigurationDto extends PartialType(
  CreateClientConfigurationDto,
) {
  @IsString()
  @IsOptional()
  _id: string;
}
