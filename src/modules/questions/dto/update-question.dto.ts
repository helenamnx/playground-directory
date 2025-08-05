import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionDto } from './create-question.dto';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
    @IsString()
    @IsNotEmpty()
    _id: string;
}
