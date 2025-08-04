import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class MenuOptionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  method: string;

  @IsString()
  @IsNotEmpty()
  endpoint: string;
}
export class CreatePlatformConfigurationDto {
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  theme: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuOptionDto)
  menuOptions: MenuOptionDto[];
}
