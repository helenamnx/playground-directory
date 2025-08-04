import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceConfigurationDto } from './create-service-configuration.dto';

export class UpdateServiceConfigurationDto extends PartialType(CreateServiceConfigurationDto) {}
