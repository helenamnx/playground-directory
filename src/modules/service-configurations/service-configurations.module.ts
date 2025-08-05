import { Module } from '@nestjs/common';
import { ServiceConfigurationsService } from './service-configurations.service';
import { ServiceConfigurationsController } from './service-configurations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ServiceConfiguration,
  ServiceConfigurationSchema,
} from './schemas/service-configuration.schema';
import { ActionSpecificationsModule } from '../action-specifications/action-specifications.module';

@Module({
  imports: [
    ActionSpecificationsModule,
    MongooseModule.forFeature([
      { name: ServiceConfiguration.name, schema: ServiceConfigurationSchema },
    ]),
  ],
  controllers: [ServiceConfigurationsController],
  providers: [ServiceConfigurationsService],
  exports: [ServiceConfigurationsService],
})
export class ServiceConfigurationsModule {}
