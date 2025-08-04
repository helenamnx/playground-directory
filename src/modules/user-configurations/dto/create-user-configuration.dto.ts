import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateUserConfigurationDto {
  @IsBoolean()
  @IsOptional()
  isNotificationEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  isEmailEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  defaultLanguage?: string;
}
