import { IsArray, IsBoolean, IsOptional } from 'class-validator';

export class UpdateIDMUserDto {
  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;

  @IsArray()
  @IsOptional()
  requiredActions?: string[];
}
