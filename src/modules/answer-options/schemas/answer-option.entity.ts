import { Thing } from '@/shared/schemas/thing.schema';
import { LanguageMapType } from '@/shared/types/language-map.type';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class AnswerOption extends Thing {
  @Prop({ type: Boolean, required: true })
  isCorrect: boolean;

  @Prop({
    type: Object,
    required: true,
  })
  value: LanguageMapType;

  @Prop({ type: Object, required: false })
  justification?: LanguageMapType;

  //TODO: ADD images
}

export const AnswerOptionSchema = SchemaFactory.createForClass(AnswerOption);
