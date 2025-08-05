import { Thing } from '@/shared/schemas/thing.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

/**
 * Represents an action specification for an external service.
 * This schema defines the structure for an action that can be performed on an external service,
 * including the HTTP method, external service URL, and optional parameters.
 * It extends the Thing schema to inherit common properties.
 */
@Schema()
export class ActionSpecification extends Thing {
  /**
   * The action that the service performs.
   * @example "getUsers"
   */
  @Prop({ type: String, required: true })
  action: string;

  /**
   * HTTP methods (e.g., GET, POST, PUT, DELETE).
   * Is not required because on frontend platforms, there are no HTTP methods
   * @example "GET"
   */
  @Prop({ type: String, required: false })
  method: string;

  /**
   * URL of the external service
   * @example "/users"
   */
  @Prop({ type: String, required: true })
  endpointPath: string;

  /**
   * Optional parameters for the action.
   */
  @Prop({ type: Object, required: false })
  params?: Record<string, any>;
}

export const ActionSpecificationSchema =
  SchemaFactory.createForClass(ActionSpecification);
