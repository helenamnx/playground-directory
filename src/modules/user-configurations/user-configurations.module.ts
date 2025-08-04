import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserConfiguration,
  UserConfigurationSchema,
} from '../user-configurations/schemas/user-configuration.schema';
import { UserConfigurationsController } from '../user-configurations/user-configurations.controller';
import { UserConfigurationsService } from '../user-configurations/user-configurations.service';

@Module({
  imports: [
    //HistoryModule,
    MongooseModule.forFeature([
      { name: UserConfiguration.name, schema: UserConfigurationSchema },
    ]),
  ],
  controllers: [UserConfigurationsController],
  providers: [UserConfigurationsService],
  exports: [UserConfigurationsService],
})
export class UserConfigurationsModule {}
