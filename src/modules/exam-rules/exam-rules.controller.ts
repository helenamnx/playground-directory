import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExamRulesService } from './exam-rules.service';
import { CreateExamRuleDto } from './dto/create-exam-rule.dto';
import { UpdateExamRuleDto } from './dto/update-exam-rule.dto';

@Controller('exam-rules')
export class ExamRulesController {
  constructor(private readonly examRulesService: ExamRulesService) {}

  @Post()
  create(@Body() createExamRuleDto: CreateExamRuleDto) {
    return this.examRulesService.create(createExamRuleDto);
  }

  @Get()
  findAll() {
    return this.examRulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examRulesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExamRuleDto: UpdateExamRuleDto) {
    return this.examRulesService.update(+id, updateExamRuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examRulesService.remove(+id);
  }
}
