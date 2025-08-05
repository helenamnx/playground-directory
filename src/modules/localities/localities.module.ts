import { Module } from '@nestjs/common';
import { LocalitiesService } from './localities.service';
import { LocalitiesController } from './localities.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Locality, LocalitySchema } from './schemas/locality.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Locality.name, schema: LocalitySchema },
    ]),
  ],
  controllers: [LocalitiesController],
  providers: [LocalitiesService],
  exports: [LocalitiesService],
})
export class LocalitiesModule {}
