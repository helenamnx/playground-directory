import { LanguageMapType } from '@/shared/types/language-map.type';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Thing } from 'src/shared/schemas/thing.schema';
@Schema()
export class ModerationStatus extends Thing {
  @Prop({ type: Object, required: true })
  status: LanguageMapType;

  @Prop({ type: String, required: true })
  alias: string;
}
export const ModerationStatusSchema =
  SchemaFactory.createForClass(ModerationStatus);
