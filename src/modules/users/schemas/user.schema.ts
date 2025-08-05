import { UserRole } from '@/modules/user-roles/schemas/user-role.schemas';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ref } from 'joi';
import mongoose from 'mongoose';
import { CreateUserConfigurationDto } from 'src/modules/user-configurations/dto/create-user-configuration.dto';
import { UserConfiguration } from 'src/modules/user-configurations/schemas/user-configuration.schema';
import { KeyValue } from 'src/shared/schemas/key-value.schema';
import { Thing } from 'src/shared/schemas/thing.schema';

@Schema()
export class User extends Thing {
  //the username of the user
  @Prop({ type: String, required: true, unique: true })
  username: string;

  //the displayed name of the user
  @Prop({ type: String, required: true })
  displayName: string; // by default, the display name is the same as the email

  //the datetime when the user was created. This attribute was added because it was on the old database.
  @Prop({ type: Date, required: false })
  userRegistrationDate: Date;

  //the old id of the users from the old database
  @Prop({ type: String, required: false })
  oldId: string;

  //the alias of the user, it is the same value as the email
  @Prop({ type: String, required: true, unique: true })
  alias: string; //same value as email

  //the external ids of the users, from others services, like Keycloak
  @Prop({ type: Object })
  externalIds: Record<string, string>;

  //the email attribute
  @Prop({ type: String, required: true, unique: true })
  email: string;

  //the roles of the user
  @Prop({ type: [{ type: String, ref: 'UserRole' }] })
  roles: UserRole[];

  //the last login datetime of the user
  @Prop({ type: Date, required: false, default: null })
  lastLogin?: Date;

  //the user configuration
  @Prop({ type: String, ref: 'UserConfiguration', required: true })
  configuration: UserConfiguration;
}
export const UserSchema = SchemaFactory.createForClass(User);
