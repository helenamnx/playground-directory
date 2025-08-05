import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Thing } from './thing.schema';
import { ActionSpecification } from '@/modules/action-specifications/schemas/action-specification.schema';

@Schema()
export class Configuration extends Thing {
  @Prop({ type: Boolean, required: true, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, required: true, default: true })
  isVisible: boolean;

  @Prop({
    type: [
      {
        type: String,
        ref: 'ActionSpecification',
      },
    ],
    required: false,
  })
  servicesEntrypoints: ActionSpecification[]; // Key-value pairs for service functionalities endpoints, ex: { "getUser": "/api/user", "updateUser": "/api/user/update" }
}
export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);
