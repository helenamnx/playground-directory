import { AnswerOption } from '@/modules/answer-options/schemas/answer-option.entity';
import { Question } from '@/modules/questions/schemas/question.schema';
import { Thing } from '@/shared/schemas/thing.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class ExamAttemptQuestion extends Thing {
  /**
   *  The reference to the question (required).
   */
  @Prop({ type: String, ref: 'Question', required: true })
  question: Question;

  /**
   * The reference to the answer option (required).
   * Is an array because the question can have multiple answer options.
   */
  @Prop({ type: [{ type: String, ref: 'AnswerOption', required: false }] })
  answers: AnswerOption[];
}

export const ExamAttemptQuestionSchema =
  SchemaFactory.createForClass(ExamAttemptQuestion);
