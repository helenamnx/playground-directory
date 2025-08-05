import { Module } from '@nestjs/common';
import { ExamRulesService } from './exam-rules.service';
import { ExamRulesController } from './exam-rules.controller';

@Module({
  controllers: [ExamRulesController],
  providers: [ExamRulesService],
})
export class ExamRulesModule {}
