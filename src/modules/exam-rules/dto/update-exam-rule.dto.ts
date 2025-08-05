import { PartialType } from '@nestjs/mapped-types';
import { CreateExamRuleDto } from './create-exam-rule.dto';

export class UpdateExamRuleDto extends PartialType(CreateExamRuleDto) {}
