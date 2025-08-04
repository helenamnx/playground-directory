import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Thing } from './thing.schema';

@Schema()
export class Person extends Thing {

  @Prop({ type: String, required: true })
  lastName: string;
  
  @Prop({ type: Number })
  age: number;

  @Prop({ type: String })
  gender: string;

  @Prop({ type: [String] })
  interests: string[];

  @Prop({ type: String })
  addressCountry: string;

  @Prop({ type: Object })
  legalDocumentation: any;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
