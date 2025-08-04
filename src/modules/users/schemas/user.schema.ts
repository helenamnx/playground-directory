import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateUserConfigurationDto } from 'src/modules/user-configurations/dto/create-user-configuration.dto';
import { UserConfiguration } from 'src/modules/user-configurations/schemas/user-configuration.schema';
import { KeyValue } from 'src/shared/schemas/key-value.schema';
import { Thing } from 'src/shared/schemas/thing.schema';

@Schema()
export class User extends Thing {
  @Prop({ type: String, required: true, unique: true })
  username: string;

  // @Prop({ type: String, required: true })
  // password: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: [{ type: String, required: true }] })
  roles: string[];

  @Prop()
  externalIds: KeyValue[];

  @Prop({ type: Date, required: false, default: null })
  lastLogin?: Date;

  @Prop({ type: String, ref: 'UserConfiguration', required: true })
  configuration: UserConfiguration;
}
export const UserSchema = SchemaFactory.createForClass(User);
