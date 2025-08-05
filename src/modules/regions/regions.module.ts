import { Module } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { RegionsController } from './regions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Region, RegionSchema } from './schemas/region.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Region.name, schema: RegionSchema }]),
  ],
  controllers: [RegionsController],
  providers: [RegionsService],
  exports: [RegionsService],
})
export class RegionsModule {}
