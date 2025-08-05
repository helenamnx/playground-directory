import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserConfigurationsModule } from '../user-configurations/user-configurations.module';
import { User, UserSchema } from './schemas/user.schema';
import { UserRolesModule } from '../user-roles/user-roles.module';

@Module({
  imports: [
    UserRolesModule,
    UserConfigurationsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
