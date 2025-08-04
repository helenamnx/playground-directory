import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from './schemas/service.schema';
import { ServiceConfigurationsModule } from '../service-configurations/service-configurations.module';
import { HttpRequestModule } from '@/shared/http-request/http-request.module';
import { SendEmailsService } from './send.email.service';
import { PlatformsModule } from '../platforms/platforms.module';

@Module({
  imports: [
    HttpRequestModule,
    ServiceConfigurationsModule,
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService, SendEmailsService],
  exports: [ServicesService],
})
export class ServicesModule {}
