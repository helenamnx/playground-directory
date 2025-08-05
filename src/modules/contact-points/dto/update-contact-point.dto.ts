import { PartialType } from '@nestjs/mapped-types';
import { CreateContactPointDto } from './create-contact-point.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateContactPointDto extends PartialType(CreateContactPointDto) {
    @IsOptional()
    @IsArray()
    contactPointUUID?: string;

    @IsString()
    @IsOptional()
    type?: string;

    @IsString()
    @IsOptional()
    value?: string;
}
