import { Injectable } from '@nestjs/common';
import { CreateExamRuleDto } from './dto/create-exam-rule.dto';
import { UpdateExamRuleDto } from './dto/update-exam-rule.dto';

@Injectable()
export class ExamRulesService {
  create(createExamRuleDto: CreateExamRuleDto) {
    return 'This action adds a new examRule';
  }

  findAll() {
    return `This action returns all examRules`;
  }

  findOne(id: number) {
    return `This action returns a #${id} examRule`;
  }

  update(id: number, updateExamRuleDto: UpdateExamRuleDto) {
    return `This action updates a #${id} examRule`;
  }

  remove(id: number) {
    return `This action removes a #${id} examRule`;
  }
}
