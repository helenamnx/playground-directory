import { Module } from '@nestjs/common';
import { UserModerationHistoryService } from './user-moderation-history.service';
import { UserModerationHistoryController } from './user-moderation-history.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserModerationHistory,
  UserModerationHistorySchema,
} from './schemas/user-moderation-history.schema';
import { ModerationStatusModule } from '../moderation-status/moderation-status.module';

@Module({
  imports: [
    ModerationStatusModule,

    MongooseModule.forFeature([
      { name: UserModerationHistory.name, schema: UserModerationHistorySchema },
    ]),
  ],
  controllers: [UserModerationHistoryController],
  providers: [UserModerationHistoryService],
  exports: [UserModerationHistoryService],
})
export class UserModerationHistoryModule {}
