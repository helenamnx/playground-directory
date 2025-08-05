import { CreateAnswerOptionDto } from '@/modules/answer-options/dto/create-answer-option.dto';
import { AnswerOption } from '@/modules/answer-options/schemas/answer-option.entity';
import { CreateCategoryDto } from '@/modules/categories/dto/create-category.dto';
import { Category } from '@/modules/categories/schemas/category.schema';
import { CreateInformationDto } from '@/modules/information/dto/create-information.dto';
import { CreateQuestionConfigurationDto } from '@/modules/question-configurations/dto/create-question-configuration.dto';
import { QuestionConfiguration } from '@/modules/question-configurations/schemas/question-configuration.schema';
import { QuestionDifficulty } from '@/shared/enums/exam-difficult.enum';
import { LanguageMap } from '@/shared/types/language-map.type';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  IsString,
  isObject,
  IsObject,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { Question } from '../schemas/question.schema';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsEnum(QuestionDifficulty)
  difficulty: string;

  @IsNotEmpty()
  @Type(() => CreateInformationDto)
  information: CreateInformationDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: Category['_id'][];

  //TODO: Change questionConfiguration to createQuestionConfigurationDto
  @IsOptional()
  @Type(() => CreateQuestionConfigurationDto)
  configuration: CreateQuestionConfigurationDto;

  @IsNotEmpty()
  @IsArray()
  @Type(() => CreateAnswerOptionDto)
  answerOptions: CreateAnswerOptionDto[];

  @IsOptional()
  @IsObject()
  observations?: LanguageMap;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  version?: number;

  @IsOptional()
  @IsString()
  previousQuestionVersion?: Question['_id'];

  // TODO: Add images
}
