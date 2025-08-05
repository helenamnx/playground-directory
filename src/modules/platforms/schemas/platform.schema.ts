import { Client } from '@/modules/clients/schemas/client.schema';
import { Organization } from '@/modules/organizations/schemas/organization.schema';
import { PlatformConfiguration } from '@/modules/platform-configurations/schemas/platform-configuration.schema';
import { Service } from '@/modules/services/schemas/service.schema';
import { AppNode } from '@/shared/schemas/app-node.schema';
import { KeyValue } from '@/shared/schemas/key-value.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Platform extends AppNode {
  @Prop({
    type: String,
    ref: 'PlatformConfiguration',
  })
  configuration: PlatformConfiguration;

  @Prop({
    type: [{ type: String, ref: 'Client', required: false, default: [] }],
  })
  clients: Client[];

  @Prop({
    type: [{ type: String, ref: 'Service', required: false, default: [] }],
  })
  services: Service[];

  @Prop({
    type: String, ref: 'Organization', required: false
  })
  organization: Organization[];
}
export const PlatformSchema = SchemaFactory.createForClass(Platform);
