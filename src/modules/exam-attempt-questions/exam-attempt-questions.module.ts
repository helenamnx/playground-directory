import { Module } from '@nestjs/common';
import { ExamAttemptQuestionsService } from './exam-attempt-questions.service';
import { ExamAttemptQuestionsController } from './exam-attempt-questions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AnswerOptionsModule } from '../answer-options/answer-options.module';
import {
  ExamAttemptQuestion,
  ExamAttemptQuestionSchema,
} from '../exam-attempt-questions/schemas/exam-attempt-answer.schema';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [
    AnswerOptionsModule,
    QuestionsModule,
    MongooseModule.forFeature([
      { name: ExamAttemptQuestion.name, schema: ExamAttemptQuestionSchema },
    ]),
  ],
  controllers: [ExamAttemptQuestionsController],
  providers: [ExamAttemptQuestionsService],
  exports: [ExamAttemptQuestionsService],
})
export class ExamAttemptQuestionsModule {}
