import { ClientConfiguration } from "@/modules/client-configurations/schemas/client-configuration.schema";
import { AppNode } from "@/shared/schemas/app-node.schema";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Client extends AppNode {
  @Prop({
    type: String,
    ref: 'ClientConfiguration',
  })
  configuration: ClientConfiguration;
}
export const ClientSchema = SchemaFactory.createForClass(Client);
