import { Configuration } from '@/shared/schemas/configuration.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

class MenuOptions {
  _id: string;
  name: string;
  method: string;
  endpoint: string;
}
@Schema()
export class PlatformConfiguration extends Configuration {
  @Prop({ type: String, required: true })
  theme: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  autoVerifyEmail: boolean;

  @Prop({ type: MenuOptions, required: false })
  menuOptions: MenuOptions;
}
export const PlatformConfigurationSchema = SchemaFactory.createForClass(
  PlatformConfiguration,
);
