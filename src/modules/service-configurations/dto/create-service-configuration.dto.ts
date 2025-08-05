import { CreateActionSpecificationDto } from '@/modules/action-specifications/dto/create-action-specification.dto';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional } from 'class-validator';

export class CreateServiceConfigurationDto {
  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @IsOptional()
  @IsArray()
  @Type(() => CreateActionSpecificationDto)
  servicesEntrypoints: CreateActionSpecificationDto[];
}
