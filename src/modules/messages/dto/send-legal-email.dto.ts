import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class SendLegalEmailDto {
  @IsString()
  @IsNotEmpty()
  fullName: string; // name and surname

  @IsString()
  @IsNotEmpty()
  dni: string; // DNI

  @IsString()
  @IsNotEmpty()
  memberNumber: string; //member number

  @IsEmail()
  @IsNotEmpty()
  email: string; //email of the user

  @IsPhoneNumber('ES') // Assuming Spain as the default region
  @IsOptional()
  phone?: string; //phone number of the user

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  incidentDate: Date; // date of the incident

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  notificationDate: Date; // date of the notification

  @IsString()
  @IsNotEmpty()
  intendedPurpose: string; // intended purpose of the email

  @IsString()
  @IsNotEmpty()
  reason: string; // reason for the email

  // @IsString()
  // @IsNotEmpty()
  // intendedDescription: string; // description of the intended purpose

  @IsString()
  @IsNotEmpty()
  contactPointName: string; // name of the contact point of the json
}
