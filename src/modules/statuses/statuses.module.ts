import { Module } from '@nestjs/common';
import { StatusesService } from './statuses.service';
import { StatusesController } from './statuses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Status, StatusSchema } from './schemas/status.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Status.name, schema: StatusSchema }]),
  ],
  controllers: [StatusesController],
  providers: [StatusesService],
  exports: [StatusesService],
})
export class StatusesModule {}
