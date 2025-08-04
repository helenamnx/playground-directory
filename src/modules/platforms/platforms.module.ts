import { Module } from '@nestjs/common';
import { PlatformsService } from './platforms.service';
import { PlatformsController } from './platforms.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Platform, PlatformSchema } from './schemas/platform.schema';
import { ClientsModule } from '../clients/clients.module';
import { HistoryModule } from '../history/history.module';
import { PlatformConfigurationsModule } from '../platform-configurations/platform-configurations.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    HistoryModule,
    PlatformConfigurationsModule,
    ClientsModule,
    ServicesModule,
    MongooseModule.forFeature([
      { name: Platform.name, schema: PlatformSchema },
    ]),
  ],
  controllers: [PlatformsController],
  providers: [PlatformsService],
  exports: [PlatformsService],
})
export class PlatformsModule {}
