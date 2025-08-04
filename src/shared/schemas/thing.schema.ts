// src/common/schemas/thing.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, now } from 'mongoose';
import { generateUUID } from '../utils/generate-uuid.util';

@Schema()
export class Thing extends Document {
  @Prop({
    type: String,
    default: () => generateUUID(),
  })
  _id: string;

  @Prop({ type: String })
  urn?: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  shortDescription: string;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  @Prop({ type: String })
  type?: string;

  @Prop({ type: String })
  url: string;

  @Prop({ type: [{ type: String, ref: 'History' }], required: false })
  history?: History[];
}
export const ThingSchema = SchemaFactory.createForClass(Thing);
