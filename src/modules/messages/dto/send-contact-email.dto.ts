import { ContactPoint } from '@/modules/contact-points/schemas/contact-point.schema';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class SendContactEmailDto {
  @IsString()
  @IsNotEmpty()
  contactTo: ContactPoint['_id'];

  @IsBoolean()
  @IsNotEmpty()
  isMember: boolean;

  @IsString()
  @IsOptional()
  memberNumber: string;

  @IsString()
  @IsNotEmpty()
  contactMethod: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('ES') // Assuming Spain as the default region
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
