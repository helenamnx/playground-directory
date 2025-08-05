import { Injectable } from '@nestjs/common';

import { AppUsersSeedService } from './app-users.seed.service';
import { CategoriesSeedService } from './categories-seed.service';
import { ClientsSeedService } from './client-seed.service';
import { ModerationStatusSeedService } from './moderation-status-seed.service';
import { OrganizationSeedService } from './organization.seed.service';
import { PlatformSeedService } from './platform-seed.service';
import { RolesSeedService } from './roles-seed.service';
import { ServicesSeedService } from './services-seed.service';
import { GroupsSeedService } from './groups.seed.service';
import { PlatformsService } from '@/modules/platforms/platforms.service';

@Injectable()
export class AppSeedService {
  constructor(
    private readonly platformSeedService: PlatformSeedService,
    private readonly clientsSeedService: ClientsSeedService,
    private readonly servicesSeedService: ServicesSeedService,
    private readonly organizationSeedService: OrganizationSeedService,
    private readonly moderationStatusSeedService: ModerationStatusSeedService,
    private readonly rolesSeedService: RolesSeedService,
    private readonly appUsersSeedService: AppUsersSeedService,
    private readonly categoriesSeedService: CategoriesSeedService,
    private readonly groupsSeedService: GroupsSeedService,
    private readonly platformsService: PlatformsService,
  ) {}

  async seedApp() {
    try {
      const platformCount = await this.platformsService.countDocuments();
      if (platformCount > 0) return;
      await this.platformSeedService.seedPlatform();
      await this.clientsSeedService.seedClient();
      await this.servicesSeedService.seedService();
      await this.organizationSeedService.seedOrganization();
      await this.moderationStatusSeedService.seedModerationStatus();
      await this.rolesSeedService.seedRoles();
      await this.groupsSeedService.seedGroups();
      await this.appUsersSeedService.seedAppUsers();
      await this.categoriesSeedService.seedCategoriesAndExamTypes();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
