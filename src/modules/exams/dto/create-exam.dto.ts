import { Category } from '@/modules/categories/schemas/category.schema';
import { CreateExamConfigurationDto } from '@/modules/exam-configurations/dto/create-exam-configuration.dto';
import { ExamType } from '@/modules/exam-types/schemas/exam-type.schema';
import { Group } from '@/modules/groups/schemas/group.schema';
import { CreateInformationDto } from '@/modules/information/dto/create-information.dto';
import { Question } from '@/modules/questions/schemas/question.schema';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Exam } from '../schemas/exam.schema';

export class CreateExamDto {
  @IsNotEmpty()
  @Type(() => CreateInformationDto)
  information: CreateInformationDto;

  @IsArray()
  questions: Question['_id'][];

  @IsString()
  @IsNotEmpty()
  examType: ExamType['_id'];

  @IsArray()
  @IsNotEmpty()
  topics: Category['_id'][];

  @IsOptional()
  @Type(() => CreateExamConfigurationDto)
  configuration?: CreateExamConfigurationDto;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  version?: number;

  @IsOptional()
  @IsString()
  previousExamVersion?: Exam['_id'];
}
