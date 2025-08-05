import { Thing } from '@/shared/schemas/thing.schema';
import { Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * @description This class represents a scope in the database from the idm service. It only have name and id.
 * @author Damian
 * @date 13/06/2025
 * @export
 * @class Scope
 * @extends {Thing}
 */
@Schema()
export class Scope extends Thing {}
export const ScopeSchema = SchemaFactory.createForClass(Scope);
