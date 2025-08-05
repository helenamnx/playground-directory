import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionConfigurationDto } from './create-question-configuration.dto';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateQuestionConfigurationDto extends PartialType(
    CreateQuestionConfigurationDto,
) {
    @IsString()
    @IsNotEmpty()
    _id: string;
}
