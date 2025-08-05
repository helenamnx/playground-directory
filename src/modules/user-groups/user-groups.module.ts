import { Module } from '@nestjs/common';
import { UserGroupsService } from './user-groups.service';
import { UserGroupsController } from './user-groups.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserGroup, UserGroupSchema } from './schemas/user-group.schema';
import { GroupsModule } from '../groups/groups.module';
import { AppUsersModule } from '../app-users/app-users.module';

@Module({
  imports: [
    AppUsersModule,
    GroupsModule,
    MongooseModule.forFeature([
      { name: UserGroup.name, schema: UserGroupSchema },
    ]),
  ],
  controllers: [UserGroupsController],
  providers: [UserGroupsService],
  exports: [UserGroupsService],
})
export class UserGroupsModule {}
