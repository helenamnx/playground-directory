import { forwardRef, Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schemas/group.schema';
import {
  UserGroup,
  UserGroupSchema,
} from '../user-groups/schemas/user-group.schema';
import {
  ExamConfiguration,
  ExamConfigurationSchema,
} from '../exam-configurations/schemas/exam-configuration.schema';
import { GroupConfigurationsModule } from '../group-configurations/group-configurations.module';
import { AppUser, AppUserSchema } from '../app-users/schemas/app-user.schema';

@Module({
  imports: [
    GroupConfigurationsModule,
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: UserGroup.name, schema: UserGroupSchema }, //TODO: find a way to refactor
      { name: ExamConfiguration.name, schema: ExamConfigurationSchema },
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
