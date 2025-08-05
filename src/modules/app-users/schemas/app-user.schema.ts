import { Subscription } from '@/modules/subscriptions/schemas/subscription.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Person } from '@/shared/schemas/person.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

import { UserModerationHistory } from '@/modules/user-moderation-history/schemas/user-moderation-history.schema';
import { UserGroup } from '@/modules/user-groups/schemas/user-group.schema';
@Schema()
export class AppUser extends Person {
  @Prop({ type: String, required: true, ref: 'User' })
  user: User;

  @Prop({ type: [{ type: String, ref: 'UserModerationHistory' }] })
  moderationStatusHistory: UserModerationHistory[];

  @Prop({ type: String, required: false })
  memberNumber?: string; //The member number of the user registered

  @Prop({ type: [{ type: String, ref: 'Subscription', default: [] }] })
  subscriptions: Subscription[];

  //attribute to indicate the groups that the user belongs to
  @Prop({ type: [{ type: String, required: false, ref: 'UserGroup' }] })
  userGroups: UserGroup[];
}

export const AppUserSchema = SchemaFactory.createForClass(AppUser);
