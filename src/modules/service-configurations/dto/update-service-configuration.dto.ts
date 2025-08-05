import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceConfigurationDto } from './create-service-configuration.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateServiceConfigurationDto extends PartialType(
  CreateServiceConfigurationDto,
) {
  @IsString()
  @IsNotEmpty()
  _id: string;
}
