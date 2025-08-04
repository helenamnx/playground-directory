import { Module } from '@nestjs/common';
import { AppUsersService } from './app-users.service';
import { AppUsersController } from './app-users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppUser, AppUserSchema } from './schemas/app-user.schema';
import { HistoryModule } from '../history/history.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    HistoryModule,
    UsersModule,
    MongooseModule.forFeature([{ name: AppUser.name, schema: AppUserSchema }]),
  ],
  controllers: [AppUsersController],
  providers: [AppUsersService],
  exports: [AppUsersService],
})
export class AppUsersModule {}
