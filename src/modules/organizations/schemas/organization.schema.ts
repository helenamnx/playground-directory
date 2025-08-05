import { ContactPoint } from '@/modules/contact-points/schemas/contact-point.schema';
import { PostalAddress } from '@/modules/postal-addresses/schemas/postal-address.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Thing } from 'src/shared/schemas/thing.schema';

/**
 * Represents an organization in the system.
 * This schema extends the Thing schema to inherit common properties.
 */
@Schema()
export class Organization extends Thing {
  @Prop({ type: String, required: true })
  organizationType: string;

  @Prop({ type: [{ type: String, ref: 'User' }] })
  users: User[];

  @Prop({ type: String, required: false })
  contactPerson: string;

  @Prop({
    type: String,
    ref: 'PostalAddress',
    required: false,
  })
  address: PostalAddress;

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

  @Prop({ type: String, required: false })
  organizationSchedule: string;

  @Prop({ type: String, required: false })
  website: string;
}
export const OrganizationSchema = SchemaFactory.createForClass(Organization);
