import { Module } from '@nestjs/common';
import { OrganizationMembersService } from './organization-members.service';
import { OrganizationMembersController } from './organization-members.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationMember, OrganizationMemberSchema } from './schemas/organization-member.schema';
import { AuthModule } from '../auth/auth.module';
import { AppUser } from '../app-users/schemas/app-user.schema';
import { AppUsersModule } from '../app-users/app-users.module';
import { ImagesModule } from '../images/images.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OrganizationMember.name, schema: OrganizationMemberSchema }]),
    AuthModule,
    AppUsersModule,
    ImagesModule,
    OrganizationsModule
  ],
  controllers: [OrganizationMembersController],
  providers: [OrganizationMembersService],
  exports: [OrganizationMembersService],
})
export class OrganizationMembersModule { }
