import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Thing } from './thing.schema';
import { KeyValue } from './key-value.schema';

@Schema()
export class AppNode extends Thing {
  @Prop({ type: String, required: false })
  externalPlatformId?: string;

  @Prop({ type: String, required: true })
  baseURL: string;

  @Prop({ type: String, required: true })
  alias: string;

  @Prop()
  externalIds: KeyValue[];

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

  @Prop({ type: String, required: true })
  email: string;
}

export const AppNodeSchema = SchemaFactory.createForClass(AppNode);
