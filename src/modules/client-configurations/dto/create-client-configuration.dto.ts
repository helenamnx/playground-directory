import { CreateActionSpecificationDto } from '@/modules/action-specifications/dto/create-action-specification.dto';
import { Prop } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateClientConfigurationDto {
  @IsString()
  @IsNotEmpty()
  defaultNotificationLanguage: string;

  @IsString()
  @IsNotEmpty()
  defaultLanguage: string;

  @IsNumber()
  @IsNotEmpty()
  maxSends: number;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  supportedLanguages: string[];

  @IsOptional()
  @IsArray()
  @Type(() => CreateActionSpecificationDto)
  servicesEntrypoints: CreateActionSpecificationDto[];

  // @IsString()
  // @IsNotEmpty()
  // forgotUrl: string;
}
