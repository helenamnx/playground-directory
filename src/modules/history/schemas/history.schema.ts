import { Action } from '@/modules/actions/schemas/action.schema';
import { Thing } from '@/shared/schemas/thing.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class History extends Thing {
  @Prop({ type: String, ref: 'Action', required: true })
  action: Action;

  @Prop({ type: String, required: false })
  previousStatus: string;

  @Prop({ type: String, required: true })
  nextStatus: string;
}
export const HistorySchema = SchemaFactory.createForClass(History);
HistorySchema.remove('history');
