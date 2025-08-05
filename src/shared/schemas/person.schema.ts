import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Thing } from './thing.schema';
import { Job } from '@/modules/jobs/schemas/job.schemas';
import { ContactPoint } from '@/modules/contact-points/schemas/contact-point.schema';
import { PostalAddress } from '@/modules/postal-addresses/schemas/postal-address.schema';

@Schema()
export class Person extends Thing {
  @Prop({ type: String })
  lastName: string;

  @Prop({ type: Number })
  age: number;

  @Prop({ type: String })
  gender: string;

  @Prop({ type: [String] })
  interests: string[];

  @Prop({ type: String })
  addressCountry: string;

  @Prop({ type: String, ref: 'Job' })
  job: Job;

  @Prop({ type: [{ type: String, ref: 'ContactPoint' }] })
  contactPoints: ContactPoint[];

  @Prop({ type: String, ref: 'PostalAddress' })
  address: PostalAddress;

  /**
   * Legal documentation of the person.
   * @example {"passport": "123456789", "DNI": "12345678X"}
   */
  @Prop({ type: Object, required: false })
  legalDocumentation: Record<string, string>;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
