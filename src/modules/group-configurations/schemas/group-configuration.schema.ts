import { Configuration } from '@/shared/schemas/configuration.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class GroupConfiguration extends Configuration {}
export const GroupConfigurationSchema =
  SchemaFactory.createForClass(GroupConfiguration);
