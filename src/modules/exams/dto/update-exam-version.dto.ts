import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { CreateExamDto } from './create-exam.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateExamVersionDto extends PartialType(CreateExamDto) {
  @IsString()
  @IsNotEmpty()
  _id: string;

  // @IsBoolean()
  // @IsNotEmpty()
  // updateVersion: boolean;
}
