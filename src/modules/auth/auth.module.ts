import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpRequestModule } from '@/shared/http-request/http-request.module';
import { UsersModule } from '../users/users.module';
import { SecurityCodesModule } from '../security-codes/security-codes.module';
import { PlatformsModule } from '../platforms/platforms.module';
import { EmailsModule } from '../emails/emails.module';
import { AppUsersModule } from '../app-users/app-users.module';
import { ServicesModule } from '../services/services.module';
import { MessagesModule } from '../messages/messages.module';
import { UserRolesModule } from '../user-roles/user-roles.module';
import { GroupsModule } from '../groups/groups.module';
import { UserGroupsModule } from '../user-groups/user-groups.module';

@Global()
@Module({
  imports: [
    UserGroupsModule,
    GroupsModule,
    UserRolesModule,
    MessagesModule,
    HttpRequestModule,
    UsersModule,
    SecurityCodesModule,
    PlatformsModule,
    EmailsModule,
    AppUsersModule,
    ServicesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
