import { UpdateContactPointDto } from '@/modules/contact-points/dto/update-contact-point.dto';
import { UpdatePostalAddressDto } from '@/modules/postal-addresses/dto/update-postal-address.dto';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOrganizationDto {

    @IsOptional()
    @IsString()
    organizationUUID?: string;


    @IsOptional()
    @IsString()
    description?: string;


    @IsOptional()
    @IsString()
    shortDescription?: string;

    @IsOptional()
    @IsString()
    contactPerson?: string;


    @IsOptional()
    @Type(() => UpdatePostalAddressDto)
    address?: UpdatePostalAddressDto;


    @IsOptional()
    @Type(() => UpdateContactPointDto)
    contactPoints?: UpdateContactPointDto[];

    @IsString()
    @IsOptional()
    organizationSchedule?: string;

    @IsString()
    @IsOptional()
    website?: string;
}
