import { User } from '@/modules/users/schemas/user.schema';
import {
  SecurityCodeStatus,
  SecurityCodeTypes,
} from '@/shared/enums/securityCode.enum';
import { Thing } from '@/shared/schemas/thing.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class SecurityCode extends Thing {
  @Prop({
    type: String,
    ref: 'User',
    required: true,
  })
  user: User;

  @Prop({ type: String, required: true, enum: SecurityCodeStatus })
  status: SecurityCodeStatus;

  @Prop({ type: String, required: true, enum: SecurityCodeTypes })
  type: SecurityCodeTypes;

  @Prop({ required: true, type: Date })
  expireDate: Date;

  @Prop({ required: true, type: Number, default: 0 })
  emailSent: number;
}

export const SecurityCodeSchema = SchemaFactory.createForClass(SecurityCode);
