import { Module } from '@nestjs/common';
import { ClientConfigurationsService } from './client-configurations.service';
import { ClientConfigurationsController } from './client-configurations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ClientConfiguration,
  ClientConfigurationSchema,
} from './schemas/client-configuration.schema';
import { ActionSpecificationsModule } from '../action-specifications/action-specifications.module';

@Module({
  imports: [
    ActionSpecificationsModule,
    MongooseModule.forFeature([
      { name: ClientConfiguration.name, schema: ClientConfigurationSchema },
    ]),
  ],
  controllers: [ClientConfigurationsController],
  providers: [ClientConfigurationsService],
  exports: [ClientConfigurationsService],
})
export class ClientConfigurationsModule {}
