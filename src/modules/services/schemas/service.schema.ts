import { Organization } from '@/modules/organizations/schemas/organization.schema';
import { ServiceConfiguration } from '@/modules/service-configurations/schemas/service-configuration.schema';
import { AppNode } from '@/shared/schemas/app-node.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Service extends AppNode {
  @Prop({
    type: String,
    ref: 'ServiceConfiguration',
  })
  configuration: ServiceConfiguration;

  @Prop({
    type: String,
    ref: 'Organization',
    required: false,
  })
  organization: Organization;
}
export const ServiceSchema = SchemaFactory.createForClass(Service);
