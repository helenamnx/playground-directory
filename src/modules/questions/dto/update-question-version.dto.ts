import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty } from 'class-validator';
import { CreateQuestionDto } from './create-question.dto';

export class UpdateQuestionVersionDto extends PartialType(CreateQuestionDto) {
  @IsString()
  @IsNotEmpty()
  _id: string;
}
