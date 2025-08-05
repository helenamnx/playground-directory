import { AppUser } from '@/modules/app-users/schemas/app-user.schema';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateExamAttemptDto {
  @IsString()
  @IsNotEmpty()
  _id: string;

  // @IsArray()
  // @IsNotEmpty()
  // @Type(() => CreateExamAttemptAnswerDto)
  // answers: CreateExamAttemptAnswerDto[];

  @IsDate()
  @IsOptional()
  endTime?: Date;

  @IsString()
  @IsNotEmpty()
  appUserId: AppUser['_id'];

  @IsString()
  @IsNotEmpty()
  status: string;
}

export class UpdateExamAttemptControllerDto {
  @IsString()
  @IsNotEmpty()
  _id: string;

  // @IsArray()
  // @IsNotEmpty()
  // @Type(() => CreateExamAttemptAnswerDto)
  // answers: CreateExamAttemptAnswerDto[];

  @IsDate()
  @IsOptional()
  endTime?: Date;

  @IsString()
  @IsNotEmpty()
  status: string;
}
