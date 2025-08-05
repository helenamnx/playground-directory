import { Module } from '@nestjs/common';
import { ContactPointsService } from './contact-points.service';
import { ContactPointsController } from './contact-points.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactPoint, ContactPointSchema } from './schemas/contact-point.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ContactPoint.name, schema: ContactPointSchema }]),
  ],
  controllers: [ContactPointsController],
  providers: [ContactPointsService],
  exports: [ContactPointsService],
})
export class ContactPointsModule { }
