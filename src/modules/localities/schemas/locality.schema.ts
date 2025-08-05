import { Thing } from '@/shared/schemas/thing.schema';
import { LanguageMapType } from '@/shared/types/language-map.type';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Locality extends Thing {
  /**
   * Value of the locality
   */
  @Prop({ type: Object, required: true })
  value: LanguageMapType;
}

export const LocalitySchema = SchemaFactory.createForClass(Locality);
