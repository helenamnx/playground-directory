import { Module } from '@nestjs/common';
import { InformationContentService } from './information-content.service';
import { InformationContentController } from './information-content.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  InformationContent,
  InformationContentSchema,
} from './schema/information-content.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InformationContent.name, schema: InformationContentSchema },
    ]),
  ],
  controllers: [InformationContentController],
  providers: [InformationContentService],
  exports: [InformationContentService],
})
export class InformationContentModule {}
