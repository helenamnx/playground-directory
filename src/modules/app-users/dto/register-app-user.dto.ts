import { CreateContactPointDto } from '@/modules/contact-points/dto/create-contact-point.dto';
import { Group } from '@/modules/groups/schemas/group.schema';
import { CreatePostalAddressDto } from '@/modules/postal-addresses/dto/create-postal-address.dto';
import { UserRole } from '@/modules/user-roles/schemas/user-role.schemas';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsString,
  IsArray,
  IsBoolean,
  IsNumber,
  IsPositive,
  IsDate,
} from 'class-validator';

export class RegisterAppUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsOptional()
  age?: number;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  memberNumber?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsArray()
  @IsOptional()
  roles?: UserRole['_id'][];

  @IsArray()
  @IsOptional()
  groups?: Group['_id'][];

  @IsNotEmpty()
  legalDocumentation: Record<string, string>;

  @IsArray()
  @IsOptional()
  @Type(() => CreateContactPointDto)
  contactPoints?: CreateContactPointDto[];

  @IsArray()
  @IsOptional()
  @Type(() => CreatePostalAddressDto)
  address?: CreatePostalAddressDto;

  @IsOptional()
  @IsString()
  job?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsPositive()
  @IsOptional()
  oldId?: string;

  @IsDate()
  @IsOptional()
  userRegistrationDate?: Date;
}
