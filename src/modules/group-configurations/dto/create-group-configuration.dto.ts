import { IsBoolean, IsOptional } from 'class-validator';

export class CreateGroupConfigurationDto {
  @IsBoolean()
  @IsOptional()
  isVisible: boolean;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
