import { Module } from '@nestjs/common';
import { ExamAttemptStatusesService } from './exam-attempt-statuses.service';
import { ExamAttemptStatusesController } from './exam-attempt-statuses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ExamAttemptStatus,
  ExamAttemptStatusSchema,
} from './schema/exam-attempt-status.schema';
import { StatusesModule } from '../statuses/statuses.module';

@Module({
  imports: [
    StatusesModule,
    MongooseModule.forFeature([
      { name: ExamAttemptStatus.name, schema: ExamAttemptStatusSchema },
    ]),
  ],
  controllers: [ExamAttemptStatusesController],
  providers: [ExamAttemptStatusesService],
  exports: [ExamAttemptStatusesService],
})
export class ExamAttemptStatusesModule {}
