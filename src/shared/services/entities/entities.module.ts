import { UsersModule } from '@/modules/users/users.module';
import { Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { AppUsersModule } from '@/modules/app-users/app-users.module';

@Module({
  imports: [UsersModule, AppUsersModule],
  controllers: [],
  providers: [EntitiesService],
  exports: [EntitiesService],
})
export class EntitiesModule {}
