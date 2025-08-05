import { Thing } from '@/shared/schemas/thing.schema';
import { LanguageMapType } from '@/shared/types/language-map.type';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Region extends Thing {
  /**
   * Value of the region
   */
  @Prop({ type: Object, required: true })
  value: LanguageMapType;
}

export const RegionSchema = SchemaFactory.createForClass(Region);
