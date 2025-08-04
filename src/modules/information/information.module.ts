import { MongooseModule } from '@nestjs/mongoose';
import { InformationController } from './information.controller';
import { InformationService } from './information.service';
import { Information, InformationSchema } from './schema/information.schema';
import { Module } from '@nestjs/common';
import { InformationContentModule } from '../information-content/information-content.module';

@Module({
  imports: [
    InformationContentModule,
    MongooseModule.forFeature([
      { name: Information.name, schema: InformationSchema },
    ]),
  ],
  controllers: [InformationController],
  providers: [InformationService],
  exports: [InformationService],
})
export class InformationModule {}
