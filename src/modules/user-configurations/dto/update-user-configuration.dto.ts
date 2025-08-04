import { PartialType } from '@nestjs/mapped-types';
import { CreateUserConfigurationDto } from './create-user-configuration.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserConfigurationDto extends PartialType(
  CreateUserConfigurationDto,
) {
  @IsString()
  @IsNotEmpty()
  _id: string;
}
