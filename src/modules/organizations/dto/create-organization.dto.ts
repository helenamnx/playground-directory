import { AppUser } from '@/modules/app-users/schemas/app-user.schema';
import { CreateContactPointDto } from '@/modules/contact-points/dto/create-contact-point.dto';
import { CreateImageDto } from '@/modules/images/dto/create-image.dto';
import { CreatePostalAddressDto } from '@/modules/postal-addresses/dto/create-postal-address.dto';
import { LanguageMap } from '@/shared/types/language-map.type';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsObject()
  description: LanguageMap;

  @IsOptional()
  @IsObject()
  shortDescription?: LanguageMap;

  @IsNotEmpty()
  @IsString()
  organizationType: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsArray()
  @Type(() => CreateContactPointDto)
  contactPoints?: CreateContactPointDto[];

  @IsString()
  @IsOptional()
  organizationSchedule?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @Type(() => CreateImageDto)
  @IsArray()
  @IsOptional()
  images?: CreateImageDto[];

  @Type(() => CreatePostalAddressDto)
  address?: CreatePostalAddressDto;
}
