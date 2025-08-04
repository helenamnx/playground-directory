import { Module } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ActionsController } from './actions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Action, ActionSchema } from './schemas/action.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Action.name,
        schema: ActionSchema,
      },
    ]),
  ],
  controllers: [ActionsController],
  providers: [ActionsService],
  exports: [ActionsService],
})
export class ActionsModule {}
