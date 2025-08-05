import { AnswerOption } from '@/modules/answer-options/schemas/answer-option.entity';
import { Question } from '@/modules/questions/schemas/question.schema';
import { IsArray, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateExamAttemptQuestionDto {
  @IsArray()
  @IsOptional()
  answers?: AnswerOption['_id'][];

  @IsString()
  @IsNotEmpty()
  question: Question['_id'];
}
