import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpRequestModule } from '@/shared/http-request/http-request.module';
import { UsersModule } from '../users/users.module';
import { SecurityCodesModule } from '../security-codes/security-codes.module';
import { PlatformsModule } from '../platforms/platforms.module';
import { EmailsModule } from '../emails/emails.module';
import { AppUser } from '../app-users/schemas/app-user.schema';
import { AppUsersModule } from '../app-users/app-users.module';

@Module({
  imports: [
    HttpRequestModule,
    UsersModule,
    SecurityCodesModule,
    PlatformsModule,
    EmailsModule,
    AppUsersModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
