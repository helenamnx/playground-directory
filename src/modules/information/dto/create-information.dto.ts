import { CreateInformationContentDto } from '@/modules/information-content/dto/create-information-content.dto';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateInformationDto {
  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsNotEmpty()
  alias: string;

  @IsNotEmpty()
  @Type(() => CreateInformationContentDto)
  content: CreateInformationContentDto;
}
