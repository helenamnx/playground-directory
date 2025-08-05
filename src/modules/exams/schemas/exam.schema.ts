import { Category } from '@/modules/categories/schemas/category.schema';
import { ExamConfiguration } from '@/modules/exam-configurations/schemas/exam-configuration.schema';
import { ExamType } from '@/modules/exam-types/schemas/exam-type.schema';
import { Information } from '@/modules/information/schema/information.schema';
import { Question } from '@/modules/questions/schemas/question.schema';
import { Thing } from '@/shared/schemas/thing.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Exam extends Thing {
  @Prop({ type: String, ref: 'Information', required: false }) //TODO: required: true
  information: Information;

  @Prop({ type: [{ type: String, ref: 'Question' }], required: true })
  questions: Question[];

  @Prop({ type: [{ type: String, ref: 'Category' }], required: true })
  topics: Category[];

  @Prop({ type: String, ref: 'ExamType' })
  examType: ExamType;

  @Prop({ type: String, required: true, ref: 'ExamConfiguration' })
  configuration: ExamConfiguration;

  @Prop({ type: Number, required: true, default: 1 })
  version: number;

  @Prop({ type: String, required: false, ref: 'Exam' })
  previousExamVersion?: Exam;
}
export const ExamSchema = SchemaFactory.createForClass(Exam);
