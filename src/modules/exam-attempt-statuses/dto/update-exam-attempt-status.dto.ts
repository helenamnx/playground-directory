import { PartialType } from '@nestjs/mapped-types';
import { CreateExamAttemptStatusDto } from './create-exam-attempt-status.dto';

export class UpdateExamAttemptStatusDto extends PartialType(CreateExamAttemptStatusDto) {}
