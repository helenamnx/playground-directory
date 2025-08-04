import { Global, Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ActionsModule } from '../actions/actions.module';
import { History, HistorySchema } from './schemas/history.schema';

@Global()
@Module({
  imports: [
    ActionsModule,
    MongooseModule.forFeature([
      {
        name: History.name,
        schema: HistorySchema,
      },
    ]),
  ],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
