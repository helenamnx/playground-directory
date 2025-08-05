import { Status } from '@/modules/statuses/schemas/status.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Thing } from 'src/shared/schemas/thing.schema';

@Schema()
export class ExamAttemptStatus extends Thing {
  @Prop({ type: String, ref: 'Status', required: true })
  status: Status;
}
export const ExamAttemptStatusSchema =
  SchemaFactory.createForClass(ExamAttemptStatus);
