import { PartialType } from '@nestjs/mapped-types';
import { CreateExamDto } from './create-exam.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateInformationDto } from '@/modules/information/dto/create-information.dto';
import { Type } from 'class-transformer';
import { UpdateInformationDto } from '@/modules/information/dto/update-information.dto';

export class UpdateExamDto extends PartialType(CreateExamDto) {
  @IsString()
  @IsNotEmpty()
  _id: string;
}
