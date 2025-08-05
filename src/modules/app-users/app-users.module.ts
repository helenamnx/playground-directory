import { Module } from '@nestjs/common';
import { AppUsersService } from './app-users.service';
import { AppUsersController } from './app-users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppUser, AppUserSchema } from './schemas/app-user.schema';
import { HistoryModule } from '../history/history.module';
import { UsersModule } from '../users/users.module';
import { UserModerationHistoryModule } from '../user-moderation-history/user-moderation-history.module';
import { JobsModule } from '../jobs/jobs.module';
import { PostalAddressesModule } from '../postal-addresses/postal-addresses.module';
import { ContactPointsModule } from '../contact-points/contact-points.module';
import { ModerationStatusModule } from '../moderation-status/moderation-status.module';

@Module({
  imports: [
    ModerationStatusModule,
    JobsModule,
    PostalAddressesModule,
    ContactPointsModule,
    UserModerationHistoryModule,
    HistoryModule,
    UsersModule,
    MongooseModule.forFeature([{ name: AppUser.name, schema: AppUserSchema }]),
  ],
  controllers: [AppUsersController],
  providers: [AppUsersService],
  exports: [AppUsersService],
})
export class AppUsersModule {}
