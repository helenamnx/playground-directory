import { Module } from '@nestjs/common';
import { ActionSpecificationsService } from './action-specifications.service';
import { ActionSpecificationsController } from './action-specifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ActionSpecification,
  ActionSpecificationSchema,
} from './schemas/action-specification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ActionSpecification.name,
        schema: ActionSpecificationSchema,
      },
    ]),
  ],
  controllers: [ActionSpecificationsController],
  providers: [ActionSpecificationsService],
  exports: [ActionSpecificationsService],
})
export class ActionSpecificationsModule {}
