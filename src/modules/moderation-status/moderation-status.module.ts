import { Module } from '@nestjs/common';
import { ModerationStatusService } from './moderation-status.service';
import { ModerationStatusController } from './moderation-status.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ModerationStatus,
  ModerationStatusSchema,
} from './schemas/moderation-status.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModerationStatus.name, schema: ModerationStatusSchema },
    ]),
  ],
  controllers: [ModerationStatusController],
  providers: [ModerationStatusService],
  exports: [ModerationStatusService],
})
export class ModerationStatusModule {}
