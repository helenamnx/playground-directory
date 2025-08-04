import { User } from '@/modules/users/schemas/user.schema';
import { KeyValue } from '@/shared/schemas/key-value.schema';
import { Person } from '@/shared/schemas/person.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Subscription } from 'rxjs';


@Schema()
export class AppUser extends Person {
  @Prop({ type: String, required: true, ref: 'User' })
  user: User;

  @Prop()
  externalIds: KeyValue[];

  @Prop({ type: [{ type: String, ref: 'Subscription', default: [] }] })
  subscriptions: Subscription[];
}

export const AppUserSchema = SchemaFactory.createForClass(AppUser);
