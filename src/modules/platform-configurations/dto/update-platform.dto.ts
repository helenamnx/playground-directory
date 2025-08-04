import { PartialType } from '@nestjs/mapped-types';
import { CreatePlatformConfigurationDto } from './create-platform.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePlatformConfigurationDto extends PartialType(
  CreatePlatformConfigurationDto,
) {
  @IsNotEmpty()
  @IsString()
  _id: string;
}
