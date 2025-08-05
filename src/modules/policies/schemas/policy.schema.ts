import { UserRole } from '@/modules/user-roles/schemas/user-role.schemas';
import {
  PoliciesDecisionStrategyEnum,
  PoliciesLogicEnum,
} from '@/shared/enums/policies.enum';

import { Thing } from '@/shared/schemas/thing.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

/**
 * @description This class represents a policy in the database from the idm service. It will have name, description and type as well
 * @author Damian
 * @date 13/06/2025
 * @export
 * @class Policy
 * @extends {Thing}
 */
@Schema()
export class Policy extends Thing {
  @Prop({ type: [{ type: String, ref: 'UserRole' }] })
  roles: UserRole[];

  @Prop({ type: String, enum: PoliciesLogicEnum })
  logic: string; // POSITIVE, OR NEGATIVE

  @Prop({ type: String, enum: PoliciesDecisionStrategyEnum })
  decisionStrategy: string; // UNANIMOUS, AFFIRMATIVE, CONSENSUS
}
export const PolicySchema = SchemaFactory.createForClass(Policy);
