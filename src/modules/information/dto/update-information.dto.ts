import { PartialType } from '@nestjs/mapped-types';
import { CreateInformationDto } from './create-information.dto';
import { UpdateInformationContentDto } from '@/modules/information-content/dto/update-information-content.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateInformationDto {
    @IsNotEmpty()
    @IsString()
    _id: string;

    @IsString()
    @IsOptional()
    author: string;


    @IsOptional()
    @Type(() => UpdateInformationContentDto)
    content: UpdateInformationContentDto;
}
