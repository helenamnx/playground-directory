import { Thing } from '@/shared/schemas/thing.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Job extends Thing {
  /**
   * Value of the employment
   */
  @Prop({ required: true })
  value: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);
