import { IsBoolean } from 'class-validator';

export class CreateServiceConfigurationDto {
  @IsBoolean()
  isActive: boolean;
}
