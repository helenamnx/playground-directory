import { LanguageMap, LanguageMapType } from '@/shared/types/language-map.type';
import { AnswerOption } from '@/modules/answer-options/schemas/answer-option.entity';
import { Category } from '@/modules/categories/schemas/category.schema';
import { Information } from '@/modules/information/schema/information.schema';
import { QuestionConfiguration } from '@/modules/question-configurations/schemas/question-configuration.schema';
import { QuestionDifficulty } from '@/shared/enums/exam-difficult.enum';
import { Thing } from '@/shared/schemas/thing.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { KeyValue } from '@/shared/schemas/key-value.schema';

@Schema()
export class Question extends Thing {
  @Prop({ type: String, enum: QuestionDifficulty, required: true })
  difficulty: string;

  @Prop({ type: String, ref: 'Information', required: true })
  information: Information;

  @Prop({ type: [{ type: String, ref: 'Category' }] })
  topics: Category[];

  @Prop({ type: String, ref: 'QuestionConfiguration', required: true })
  configuration: QuestionConfiguration;

  @Prop({ type: [{ type: String, ref: 'AnswerOption' }] })
  answerOptions: AnswerOption[];

  @Prop({
    type: Object,
    required: false,
  })
  observations?: LanguageMapType;

  @Prop({ type: Number, required: true, default: 1 })
  version: number;

  @Prop({ type: String, required: false, ref: 'Question' })
  previousQuestionVersion?: Question;
}
export const QuestionSchema = SchemaFactory.createForClass(Question);
