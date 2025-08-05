import { Service } from '@/modules/services/schemas/service.schema';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEmailDto {
  //TODO: mejorar dto

  @IsNotEmpty()
  platform: Service;

  @IsEmail()
  @IsNotEmpty()
  sender: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  emailType: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  //TODO: mejorar dto
  @IsArray()
  @IsNotEmpty()
  recipients: any[];

  @IsArray()
  ccRecipients: { email: string }[];

  @IsArray()
  bccRecipients: { email: string }[];

  @IsOptional()
  attachments?: Express.Multer.File[];
}
