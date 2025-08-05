import { Module } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { UserRolesController } from './user-roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRole, UserRoleSchema } from './schemas/user-role.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserRole.name, schema: UserRoleSchema },
    ]),
  ],
  controllers: [UserRolesController],
  providers: [UserRolesService],
  exports: [UserRolesService],
})
export class UserRolesModule {}
