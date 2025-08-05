import { AppUser } from '@/modules/app-users/schemas/app-user.schema';
import { Group } from '@/modules/groups/schemas/group.schema';
import { Thing } from '@/shared/schemas/thing.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserGroup extends Thing {
  @Prop({ type: String, ref: 'AppUser', required: true })
  appUser: AppUser;

  @Prop({ type: String, ref: 'Group', required: true })
  group: Group;
}
export const UserGroupSchema = SchemaFactory.createForClass(UserGroup);
