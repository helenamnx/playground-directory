import { Module } from '@nestjs/common';
import { PlatformConfigurationsService } from './platform-configurations.service';
import { PlatformConfigurationsController } from './platform-configurations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PlatformConfiguration } from './entities/platform-configuration.entity';
import { PlatformConfigurationSchema } from './schemas/platform-configuration.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PlatformConfiguration.name,
        schema: PlatformConfigurationSchema,
      },
    ]),
  ],
  controllers: [PlatformConfigurationsController],
  providers: [PlatformConfigurationsService],
  exports: [PlatformConfigurationsService],
})
export class PlatformConfigurationsModule {}
