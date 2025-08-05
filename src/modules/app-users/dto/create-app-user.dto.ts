import { CreateContactPointDto } from '@/modules/contact-points/dto/create-contact-point.dto';
import { Group } from '@/modules/groups/schemas/group.schema';
import { ModerationStatus } from '@/modules/moderation-status/schemas/moderation-status.schema';
import { CreatePostalAddressDto } from '@/modules/postal-addresses/dto/create-postal-address.dto';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { KeyValue } from '@/shared/schemas/key-value.schema';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
  isArray,
} from 'class-validator';

export class CreateAppUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  memberNumber?: string;

  @IsNumber()
  @IsOptional()
  age?: number;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsArray()
  @IsOptional()
  moderationStatus?: ModerationStatus['_id'][];

  @IsNotEmpty()
  legalDocumentation: Record<string, string>;

  @Type(() => CreateUserDto)
  @IsNotEmpty()
  user: CreateUserDto;

  @IsArray()
  @IsOptional()
  @Type(() => CreateContactPointDto)
  contactPoints?: CreateContactPointDto[];

  @IsOptional()
  @Type(() => CreatePostalAddressDto)
  address?: CreatePostalAddressDto;

  @IsOptional()
  @IsString()
  job?: string;
}
