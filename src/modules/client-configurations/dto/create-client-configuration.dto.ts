import { Prop } from '@nestjs/mongoose';
import { IsString, IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class CreateClientConfigurationDto {
  @IsString()
  @IsNotEmpty()
  defaultNotificationLanguage: string;

  @IsNumber()
  @IsNotEmpty()
  maxSends: number;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  supportedLanguages: string[];

  @IsString()
  @IsNotEmpty()
  forgotUrl: string;
}
