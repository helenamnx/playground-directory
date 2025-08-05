import { Client } from '@/modules/clients/schemas/client.schema';
import { Scope } from '@/modules/scopes/schemas/scope.schema';

import { Thing } from '@/shared/schemas/thing.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Resource extends Thing {
  @Prop({ type: String, ref: 'Client', required: true })
  owner: Client;

  @Prop({ type: [{ type: String }] })
  uris: string[];

  @Prop({ type: String })
  displayName: string;

  @Prop({ type: [{ type: String, ref: 'Scope' }] })
  scopes: Scope[];

  @Prop({ type: Boolean, default: false })
  ownerManagedAccess: boolean;
}
export const ResourceSchema = SchemaFactory.createForClass(Resource);
