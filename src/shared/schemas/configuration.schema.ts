import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Thing } from './thing.schema';

@Schema()
export class Configuration extends Thing {
  @Prop({ type: Boolean, required: true, default: true })
  isActive: boolean;
}
export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);
