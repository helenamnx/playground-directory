import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupConfigurationDto } from './create-group-configuration.dto';

export class UpdateGroupConfigurationDto extends PartialType(CreateGroupConfigurationDto) {}
