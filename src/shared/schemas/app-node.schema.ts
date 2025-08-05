import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Thing } from './thing.schema';
import { KeyValue } from './key-value.schema';
import mongoose from 'mongoose';

@Schema()
export class AppNode extends Thing {
  @Prop({ type: String, required: false })
  externalPlatformId?: string;

  @Prop({ type: String, required: true })
  baseURL: string;

  @Prop({ type: String, required: true })
  alias: string;

  @Prop({ type: Object })
  externalIds: Record<string, string>;

  @Prop({
    type: String,
    required: true,
  })
  technology: string;

  @Prop({
    type: String,
    required: true,
  })
  tenant: string;

  @Prop({ type: String, required: false })
  email: string;

  @Prop({ type: String, required: false })
  clientId: string; //client id of the platform

  @Prop({ type: String, required: false })
  clientSecret: string; //client secret of the platform
}

export const AppNodeSchema = SchemaFactory.createForClass(AppNode);
