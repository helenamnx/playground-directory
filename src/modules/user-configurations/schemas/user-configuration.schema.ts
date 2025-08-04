import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Configuration } from 'src/shared/schemas/configuration.schema';

@Schema()
export class UserConfiguration extends Configuration {
  @Prop({ type: Boolean, required: true, default: true })
  isNotificationEnabled: boolean;

  @Prop({ type: Boolean, required: true, default: true })
  isEmailEnabled: boolean;

  @Prop({ type: String, required: true, default: 'EN' })
  defaultLanguage: string;
}
export const UserConfigurationSchema =
  SchemaFactory.createForClass(UserConfiguration);
