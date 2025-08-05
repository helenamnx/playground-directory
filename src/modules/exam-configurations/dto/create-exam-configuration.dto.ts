import { CreateExamRuleDto } from '@/modules/exam-rules/dto/create-exam-rule.dto';
import { Group } from '@/modules/groups/schemas/group.schema';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateExamConfigurationDto {
  @IsOptional()
  @IsBoolean()
  isTimerEnabled?: boolean;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Min(1)
  @IsInt()
  numberOfQuestions?: number;

  @IsOptional()
  @IsBoolean()
  showAnswers?: boolean;

  @IsOptional()
  @IsBoolean()
  timed?: boolean;

  @IsOptional()
  @IsBoolean()
  canAutogenerate?: boolean;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  maxAttempts?: number;

  @IsOptional()
  @IsNumber()
  passingScore?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxTopics?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(1)
  @IsInt()
  maxScore?: number;

  @IsOptional()
  @Type(() => CreateExamRuleDto)
  rules?: CreateExamRuleDto;

  @IsArray()
  @IsOptional()
  groups?: Group['_id'][];
}
