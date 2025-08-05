import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { EmailsService } from '../emails/emails.service';
import { EmailsModule } from '../emails/emails.module';
import { PlatformsModule } from '../platforms/platforms.module';
import { ClientsModule } from '../clients/clients.module';
import { ContactPointsModule } from '../contact-points/contact-points.module';
import { AppUser } from '../app-users/schemas/app-user.schema';
import { AppUsersModule } from '../app-users/app-users.module';

@Module({
  imports: [
    EmailsModule,
    PlatformsModule,
    ClientsModule,
    ContactPointsModule,
    AppUsersModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
