import { AppUser } from '@/modules/app-users/schemas/app-user.schema';
import { Category } from '@/modules/categories/schemas/category.schema';
import { ExamType } from '@/modules/exam-types/schemas/exam-type.schema';
import { Exam } from '@/modules/exams/schemas/exam.schema';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateExamAttemptControllerDto {
  @IsString()
  @IsOptional()
  examType?: ExamType['_id'];

  @IsString()
  @IsOptional()
  exam?: Exam['_id'];

  @IsArray()
  @IsOptional()
  topics?: Category['_id'][];
}

export class GenerateExamAttemptDto extends GenerateExamAttemptControllerDto {
  @IsString()
  @IsNotEmpty()
  appUser: AppUser['_id'];

  @IsString()
  @IsNotEmpty()
  language: string;
}
