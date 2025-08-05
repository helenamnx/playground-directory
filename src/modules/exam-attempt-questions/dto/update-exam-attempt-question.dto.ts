import { PartialType } from '@nestjs/mapped-types';
import { CreateExamAttemptQuestionDto } from './create-exam-attempt-question.dto';

export class UpdateExamAttemptQuestionDto extends PartialType(CreateExamAttemptQuestionDto) {}
