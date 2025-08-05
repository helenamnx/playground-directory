import { Module } from '@nestjs/common';
import { AppSeedService } from './app-seed.service';
import { PlatformSeedService } from './platform-seed.service';
import { PlatformsModule } from '@/modules/platforms/platforms.module';
import { ClientsSeedService } from './client-seed.service';
import { ClientsModule } from '@/modules/clients/clients.module';
import { ServicesModule } from '@/modules/services/services.module';
import { ServicesSeedService } from './services-seed.service';
import { ModerationStatusModule } from '@/modules/moderation-status/moderation-status.module';
import { OwnPlatformTokenMiddleware } from '@/shared/middleware/own-platform-token.middleware';
import { AuthModule } from '@/modules/auth/auth.module';
import { Organization } from '@/modules/organizations/schemas/organization.schema';
import { OrganizationSeedService } from './organization.seed.service';
import { ModerationStatusSeedService } from './moderation-status-seed.service';
import { RolesSeedService } from './roles-seed.service';
import { AppUsersSeedService } from './app-users.seed.service';
import { CategoriesSeedService } from './categories-seed.service';
import { OrganizationsModule } from '@/modules/organizations/organizations.module';
import { LocalitiesModule } from '@/modules/localities/localities.module';
import { StatusesModule } from '@/modules/statuses/statuses.module';
import { UserRolesModule } from '@/modules/user-roles/user-roles.module';
import { AppUsersModule } from '@/modules/app-users/app-users.module';
import { CategoryScopesModule } from '@/modules/category-scopes/category-scopes.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { ExamTypesModule } from '@/modules/exam-types/exam-types.module';
import { GroupsModule } from '@/modules/groups/groups.module';
import { GroupsSeedService } from './groups.seed.service';
import { UserGroupsModule } from '@/modules/user-groups/user-groups.module';

@Module({
  imports: [
    UserGroupsModule,
    GroupsModule,
    OrganizationsModule,
    LocalitiesModule,
    StatusesModule,
    UserRolesModule,
    AppUsersModule,
    CategoryScopesModule,
    CategoriesModule,
    ExamTypesModule,
    AuthModule,
    PlatformsModule,
    ClientsModule,
    ServicesModule,
    ModerationStatusModule,
  ],
  providers: [
    GroupsSeedService,
    AppSeedService,
    ServicesSeedService,
    PlatformSeedService,
    ClientsSeedService,
    OrganizationSeedService,
    ModerationStatusSeedService,
    RolesSeedService,
    AppUsersSeedService,
    CategoriesSeedService,
    OrganizationSeedService,
  ],
  exports: [
    GroupsSeedService,
    AppSeedService,
    ServicesSeedService,
    PlatformSeedService,
    ClientsSeedService,
    OrganizationSeedService,
    ModerationStatusSeedService,
    RolesSeedService,
    AppUsersSeedService,
    CategoriesSeedService,
    OrganizationSeedService,
  ],
})
export class AppSeedModule {}
