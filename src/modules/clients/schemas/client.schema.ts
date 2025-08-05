import { ClientConfiguration } from '@/modules/client-configurations/schemas/client-configuration.schema';
import { ContactPoint } from '@/modules/contact-points/schemas/contact-point.schema';
import { Information } from '@/modules/information/schema/information.schema';
import { Organization } from '@/modules/organizations/schemas/organization.schema';
import { AppNode } from '@/shared/schemas/app-node.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Client extends AppNode {
  @Prop({
    type: String,
    ref: 'ClientConfiguration',
  })
  configuration: ClientConfiguration;

  @Prop({
    type: String,
    ref: 'Organization',
    required: false,
  })
  organization: Organization;

  @Prop({
    type: [
      {
        type: String,
        ref: 'Information',
        required: false,
      },
    ],
  })
  information: Information[];

  @Prop({
    type: [
      {
        type: String,
        ref: 'ContactPoint',
        required: false,
      },
    ],
  })
  contactPoints: ContactPoint[];
}
export const ClientSchema = SchemaFactory.createForClass(Client);
