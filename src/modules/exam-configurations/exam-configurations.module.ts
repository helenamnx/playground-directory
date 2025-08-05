import { Module } from '@nestjs/common';
import { ExamConfigurationsService } from './exam-configurations.service';
import { ExamConfigurationsController } from './exam-configurations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ExamConfiguration,
  ExamConfigurationSchema,
} from './schemas/exam-configuration.schema';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [
    GroupsModule,
    MongooseModule.forFeature([
      { name: ExamConfiguration.name, schema: ExamConfigurationSchema },
    ]),
  ],
  controllers: [ExamConfigurationsController],
  providers: [ExamConfigurationsService],
  exports: [ExamConfigurationsService],
})
export class ExamConfigurationsModule {}
