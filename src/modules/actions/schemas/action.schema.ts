import { Thing } from '@/shared/schemas/thing.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// export enum AgentTypeEnum {
//   VISITOR = 'VISITOR',
//   ORGANIZATION_MEMBER = 'ORGANIZATION_MEMBER',
// }

// export enum ActionTypeEnum {
//   STATUS_CHANGE = 'STATUS_CHANGE',
//   CREATE_ORDER = 'CREATE_ORDER',
//   UPDATE_ORDER = 'UPDATE_ORDER',
//   ADD_DEPOSIT = 'ADD_DEPOSIT',
// }

/**
 * Action schema representing an action performed in the system.
 * Extends the Thing schema to include common properties.
 */
@Schema()
export class Action extends Thing {
  /**
   * The type of action performed.
   * Example: "status_change", "create_order", "update_order".
   */
  @Prop({ type: String, required: true })
  actionType: string;

  /**
   * The status of the action.
   * Example: "CompletedActionStatus", "FailedActionStatus".
   */
  @Prop({ type: String, required: false })
  actionStatus: string;

  /**
   * The ID of the agent who performed the action.
   * This could be a user ID or an organization ID.
   */
  @Prop({ type: String, required: false })
  agent?: string;

  /**
   * The type of the agent.
   * Can be either "Person" or "Organization".
   */
  @Prop({ type: String, required: true })
  agentType: string;

  /**
   * The ID of the object on which the action was performed.
   * Example: an order ID, a product ID.
   */
  @Prop({ type: String, required: false })
  object?: string;

  /**
   * The type of the object.
   * Example: "Order", "Product".
   */
  @Prop({ type: String, required: false })
  objectType?: string;

  /**
   * The start time of the action.
   * Defaults to the current date and time.
   */
  @Prop({ type: Date, default: Date.now })
  startTime?: Date;

  /**
   * The end time of the action.
   * Optional field.
   */
  @Prop({ type: Date })
  endTime?: Date;

  /**
   * Information about any errors that occurred during the action.
   * Optional field.
   */
  @Prop({ type: String })
  error?: string;

  /**
   * The instrument used to perform the action.
   * Example: "System", "Manual".
   * Optional field.
   */
  @Prop({ type: String })
  instrument?: string;

  /**
   * The location where the action was performed.
   * Example: "Online", "In-store".
   * Optional field.
   */
  @Prop({ type: String })
  location?: string;

  /**
   * The ID of the participant involved in the action.
   * Optional field.
   */
  @Prop({ type: String, required: false })
  participant?: string;

  /**
   * The type of the participant.
   * Example: "Person", "Organization".
   * Optional field.
   */
  @Prop({ type: String })
  participantType?: string;

  /**
   * The ID of the provider of the service.
   * Optional field.
   */
  @Prop({ type: String, required: false })
  provider?: string;

  /**
   * The type of the provider.
   * Example: "Person", "Organization".
   * Optional field.
   */
  @Prop({ type: String })
  providerType?: string;

  /**
   * The ID of the result produced by the action.
   * Optional field.
   */
  @Prop({ type: String, required: false })
  result?: string;

  /**
   * The type of the result.
   * Example: "Order", "Product".
   * Optional field.
   */
  @Prop({ type: String })
  resultType?: string;

  /**
   * The target or URL of the action.
   * Optional field.
   */
  @Prop({ type: String })
  target?: string;
}

/**
 * Schema factory for the Action schema.
 */
export const ActionSchema = SchemaFactory.createForClass(Action);
