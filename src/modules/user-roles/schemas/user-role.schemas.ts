import { Permission } from '@/modules/permissions/schemas/permission.schema';
import { Service } from '@/modules/services/schemas/service.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Thing } from 'src/shared/schemas/thing.schema';

@Schema()
export class UserRole extends Thing {
  //This attribute is to represent the service origin of the user role
  //For example, is the serviceID is the service id form keycloak, it means that the user role is from keycloak
  @Prop({ type: String, required: true, ref: 'Service' })
  serviceId: Service;

  //This attribute represents the external id of the role
  @Prop({ type: String, required: true })
  externalId: string;

  //This attribute represents the alias of the role
  @Prop({ type: String, required: true })
  alias: string;

  // This attribute is to represent the actions that a user can perform
  @Prop({ type: [{ type: String, ref: 'Permission' }] })
  permissions: Permission[];

  @Prop({ type: [{ type: String, required: false, ref: 'UserRole' }] })
  parents: UserRole[];
}
export const UserRoleSchema = SchemaFactory.createForClass(UserRole);
