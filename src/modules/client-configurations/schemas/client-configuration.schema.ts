import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Configuration } from 'src/shared/schemas/configuration.schema';

@Schema()
export class ClientConfiguration extends Configuration {
  @Prop({ required: true, default: 'en' })
  defaultNotificationLanguage: string;

  @Prop({ required: true, default: 1 })
  maxSends: number;

  @Prop({ required: true, default: 'en' })
  supportedLanguages: string[];

  @Prop({ required: true, type: String })
  forgotUrl: string;
}

export const ClientConfigurationSchema =
  SchemaFactory.createForClass(ClientConfiguration);
