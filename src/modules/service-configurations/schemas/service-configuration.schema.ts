import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Configuration } from 'src/shared/schemas/configuration.schema';

@Schema()
export class ServiceConfiguration extends Configuration {}

export const ServiceConfigurationSchema =
  SchemaFactory.createForClass(ServiceConfiguration);
