import { AppUser } from '@/modules/app-users/schemas/app-user.schema';
import { ExamAttemptQuestion } from '@/modules/exam-attempt-questions/schemas/exam-attempt-answer.schema';
import { ExamAttemptStatus } from '@/modules/exam-attempt-statuses/schema/exam-attempt-status.schema';
import { ExamRule } from '@/modules/exam-rules/entities/exam-rule.entity';
import { Exam } from '@/modules/exams/schemas/exam.schema';
import { Thing } from '@/shared/schemas/thing.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class ExamAttempt extends Thing {
  //number to indicate the score of the exam attempt. It is null if the exam is not completed
  @Prop({ type: Number, default: 0 })
  score: number;

  //array of answers to indicate the questions of the exam attempt
  @Prop({
    type: [{ type: String, ref: 'ExamAttemptQuestion', required: true }],
  })
  questions: ExamAttemptQuestion[];

  //string to indicate the status of the exam attempt. Example: PENDING, COMPLETED, IN_PROCESS
  @Prop({ type: [{ type: String, ref: 'ExamAttemptStatus' }] })
  statusHistory: ExamAttemptStatus[];

  //date to indicate the start time of the exam attempt
  @Prop({ type: Date, default: new Date() })
  startTime: Date;

  //date to indicate when the exam attempt is finished
  @Prop({ type: Date })
  endTime: Date;

  //relation to the app user who attempted the exam
  @Prop({ type: String, ref: 'AppUser' })
  appUser: AppUser;

  //relation to the exam
  @Prop({ type: String, ref: 'Exam' })
  exam: Exam;

  //rules of the exam
  @Prop({ type: String, ref: 'ExamRule' })
  rules: ExamRule;
}
export const ExamAttemptSchema = SchemaFactory.createForClass(ExamAttempt);
