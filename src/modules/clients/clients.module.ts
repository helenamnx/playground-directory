import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientConfigurationsModule } from '../client-configurations/client-configurations.module';
import { Client, ClientSchema } from './schemas/client.schema';
import { InformationModule } from '../information/information.module';
import { ContactPointsModule } from '../contact-points/contact-points.module';
import { EmailsModule } from '../emails/emails.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    ContactPointsModule,
    InformationModule,
    MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),
    ClientConfigurationsModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
