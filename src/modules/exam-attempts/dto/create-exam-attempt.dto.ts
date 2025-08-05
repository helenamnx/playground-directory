import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Exam } from '@/modules/exams/schemas/exam.schema';
import { AppUser } from '@/modules/app-users/schemas/app-user.schema';

export class CreateExamAttemptDto {
  @IsString()
  @IsNotEmpty()
  examId: Exam['_id'];

  @IsString()
  @IsNotEmpty()
  appUserId: AppUser['_id'];
}

export class CreateExamAttemptControllerDto {
  @IsString()
  @IsNotEmpty()
  examId: Exam['_id'];
}
