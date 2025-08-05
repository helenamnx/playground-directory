// src/common/schemas/thing.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, now } from 'mongoose';
import { generateUUID } from '../utils/generate-uuid.util';
import mongoose from 'mongoose';
import { LanguageMapType } from '../types/language-map.type';
@Schema()
export class Thing extends Document {
  @Prop({
    type: String,
    default: () => generateUUID(),
  })
  _id: string;

  @Prop({ type: String })
  urn?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  name: string | LanguageMapType;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  description: string | LanguageMapType;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  shortDescription: string | LanguageMapType;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  /**
   * This attribute is used to prioritize the list order of the items that will
   * be returned by the API.
   * If it is null, it will have no priority.
   * If it has a value, it will be used to sort the items in ascending order.
   * The lower the value, the higher the priority.
   */
  @Prop({ type: Number })
  listOrder?: number;

  @Prop({ type: String })
  type?: string;

  @Prop({ type: String })
  url: string;

  @Prop({ type: [{ type: String, ref: 'History' }], required: false })
  history?: History[];
}
export const ThingSchema = SchemaFactory.createForClass(Thing);
