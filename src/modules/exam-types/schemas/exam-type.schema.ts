import { Category } from '@/modules/categories/schemas/category.schema';
import { ExamConfiguration } from '@/modules/exam-configurations/schemas/exam-configuration.schema';
import { ExamRule } from '@/modules/exam-rules/entities/exam-rule.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class ExamType extends Category {
  //this attribute represents the configuration of the exam type
  //its values will be override by the configuration of the exam

  @Prop({ type: String, required: true, ref: 'ExamConfiguration' })
  configuration: ExamConfiguration;
}
export const ExamTypeSchema = SchemaFactory.createForClass(ExamType);
