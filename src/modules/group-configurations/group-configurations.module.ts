import { Module } from '@nestjs/common';
import { GroupConfigurationsService } from './group-configurations.service';
import { GroupConfigurationsController } from './group-configurations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GroupConfiguration,
  GroupConfigurationSchema,
} from './schemas/group-configuration.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GroupConfiguration.name, schema: GroupConfigurationSchema },
    ]),
  ],
  controllers: [GroupConfigurationsController],
  providers: [GroupConfigurationsService],
  exports: [GroupConfigurationsService],
})
export class GroupConfigurationsModule {}
