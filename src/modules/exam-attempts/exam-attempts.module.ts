import { Module } from '@nestjs/common';
import { ExamAttemptsService } from './exam-attempts.service';
import { ExamAttemptsController } from './exam-attempts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamAttempt, ExamAttemptSchema } from './schemas/exam-attempt.schema';
import { ExamsModule } from '../exams/exams.module';
import { QuestionsModule } from '../questions/questions.module';
import { AnswerOptionsModule } from '../answer-options/answer-options.module';
import { AppUsersModule } from '../app-users/app-users.module';
import { ExamTypesModule } from '../exam-types/exam-types.module';
import { ExamAttemptStatusesModule } from '../exam-attempt-statuses/exam-attempt-statuses.module';
import { UserRolesModule } from '../user-roles/user-roles.module';
import { InformationModule } from '../information/information.module';
import { ExamAttemptQuestionsModule } from '../exam-attempt-questions/exam-attempt-questions.module';

@Module({
  imports: [
    InformationModule,
    UserRolesModule,
    ExamAttemptStatusesModule,
    ExamTypesModule,
    AppUsersModule,
    ExamsModule,
    ExamAttemptQuestionsModule,
    QuestionsModule,
    AnswerOptionsModule,
    MongooseModule.forFeature([
      { name: ExamAttempt.name, schema: ExamAttemptSchema },
    ]),
  ],
  controllers: [ExamAttemptsController],
  providers: [ExamAttemptsService],
  exports: [ExamAttemptsService],
})
export class ExamAttemptsModule {}
