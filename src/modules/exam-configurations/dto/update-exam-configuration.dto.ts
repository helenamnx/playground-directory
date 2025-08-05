import { PartialType } from '@nestjs/mapped-types';
import { CreateExamConfigurationDto } from './create-exam-configuration.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateExamConfigurationDto extends PartialType(
  CreateExamConfigurationDto,
) {
  @IsString()
  @IsNotEmpty()
  _id: string;
}
