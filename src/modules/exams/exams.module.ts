import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Exam, ExamSchema } from './schemas/exam.schema';
import { ExamConfigurationsModule } from '../exam-configurations/exam-configurations.module';
import { CategoriesModule } from '../categories/categories.module';
import { QuestionsModule } from '../questions/questions.module';
import { InformationModule } from '../information/information.module';
import { ExamTypesModule } from '../exam-types/exam-types.module';
import { ExamAttemptsModule } from '../exam-attempts/exam-attempts.module';
import {
  ExamAttempt,
  ExamAttemptSchema,
} from '../exam-attempts/schemas/exam-attempt.schema';

@Module({
  imports: [
    ExamTypesModule,
    InformationModule,
    CategoriesModule,
    QuestionsModule,
    ExamConfigurationsModule,
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: ExamAttempt.name, schema: ExamAttemptSchema },
    ]),
  ],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
