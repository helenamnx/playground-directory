import { AnswerOption } from '@/modules/answer-options/schemas/answer-option.entity';
import { Question } from '@/modules/questions/schemas/question.schema';
import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ExamAttempt } from '../schemas/exam-attempt.schema';
import { AppUser } from '@/modules/app-users/schemas/app-user.schema';
import { ExamAttemptQuestion } from '@/modules/exam-attempt-questions/schemas/exam-attempt-answer.schema';

export class UpdateExamAttemptQuestionControllerDto {
  @IsString()
  @IsNotEmpty()
  examAttempt: ExamAttempt['_id'];

  @IsArray()
  @IsNotEmpty()
  answerOptions: AnswerOption['_id'][];

  @IsString()
  @IsNotEmpty()
  question: Question['_id'];
}

export class UpdateExamAttemptQuestionControllerNewDto {
  @IsString()
  @IsNotEmpty()
  examAttempt: ExamAttempt['_id'];

  @IsArray()
  @IsOptional()
  answers?: AnswerOption['_id'][]; //answers can be null, because if the user does not select any answer option, the answerOptions will be null

  @IsString()
  @IsNotEmpty()
  examAttemptQuestion: ExamAttemptQuestion['_id'];
}

export class UpdateExamAttemptAnswerDto extends UpdateExamAttemptQuestionControllerDto {
  @IsString()
  @IsNotEmpty()
  appUserId: AppUser['_id'];
}

export class UpdateExamAttemptAnswerNewDto extends UpdateExamAttemptQuestionControllerNewDto {
  @IsString()
  @IsNotEmpty()
  appUserId: AppUser['_id'];
}
