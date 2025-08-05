import { PartialType } from '@nestjs/mapped-types';
import { CreateAnswerOptionDto } from './create-answer-option.dto';
import { IsNotEmpty, IsString } from 'class-validator';


export class UpdateAnswerOptionDto extends PartialType(CreateAnswerOptionDto) {
    @IsNotEmpty()
    @IsString()
    _id: string;
}
