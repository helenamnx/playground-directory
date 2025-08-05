import { ModerationStatus } from '@/modules/moderation-status/schemas/moderation-status.schema';
import { LanguageMapType } from '@/shared/types/language-map.type';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Thing } from 'src/shared/schemas/thing.schema';

@Schema()
export class UserModerationHistory extends Thing {
  @Prop({ type: String, ref: 'ModerationStatus', required: true })
  moderationStatus: ModerationStatus;

  @Prop({ type: Object, required: false })
  observation?: LanguageMapType;
}
export const UserModerationHistorySchema = SchemaFactory.createForClass(
  UserModerationHistory,
);
