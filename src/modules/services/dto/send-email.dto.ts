import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';

export class SendEmailDto {
  @IsNotEmpty()
  @IsString()
  externalPlatformId: string;

  @IsNotEmpty()
  @IsString()
  sender: string;

  @IsNotEmpty()
  @IsEmail()
  senderEmail: string;

  @IsNotEmpty()
  @IsString()
  senderType: string;

  @IsNotEmpty()
  @IsArray()
  @IsEmail({}, { each: true })
  recipients: string[];

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ContentDto)
  content: ContentDto;

  @IsNotEmpty()
  @IsString()
  language: string;

  @IsNotEmpty()
  @IsObject()
  variables: Record<string, string>;
}

class ContentDto {
  @IsNotEmpty()
  @IsString()
  html: string;

  @IsNotEmpty()
  @IsString()
  txt: string;
}
