import { Policy } from '@/modules/policies/schemas/policy.schema';
import { Resource } from '@/modules/resources/schemas/resource.schema';
import { Scope } from '@/modules/scopes/schemas/scope.schema';
import { UserRole } from '@/modules/user-roles/schemas/user-role.schemas';
import {
  PoliciesDecisionStrategyEnum,
  PoliciesLogicEnum,
} from '@/shared/enums/policies.enum';

import { Thing } from '@/shared/schemas/thing.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

/**
 * @description This class represents a permission in the database from the idm service.
 *  It will have name, description and type as well
 * @author Damian
 * @date 13/06/2025
 * @export
 * @class Permission
 * @extends {Thing}
 */
@Schema()
export class Permission extends Thing {
  @Prop({ type: [{ type: String, ref: 'UserRole' }] })
  roles: UserRole[];

  @Prop({ type: [{ type: String, ref: 'Scope' }] })
  scopes: Scope[];

  @Prop({ type: [{ type: String, ref: 'Policy' }] })
  policies: Policy[];

  @Prop({ type: [{ type: String, ref: 'Resource' }] })
  resources: Resource[];

  @Prop({ type: String, enum: PoliciesLogicEnum })
  logic: string; // POSITIVE, OR NEGATIVE

  @Prop({ type: String, enum: PoliciesDecisionStrategyEnum })
  decisionStrategy: string; // UNANIMOUS, AFFIRMATIVE, CONSENSUS
}
export const PermissionSchema = SchemaFactory.createForClass(Permission);
