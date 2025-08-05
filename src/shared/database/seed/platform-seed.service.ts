import { Injectable } from '@nestjs/common';
import { PlatformsService } from '@/modules/platforms/platforms.service';
import ownPlatformMockDev from '@/shared/database/data/seed-mocks/development-seed/own-platform.mock.json';
import { compileVariablesFromJSON } from '../../utils/handlebars.utils';
import { NodeEnvEnum } from '@/shared/enums/node-env.enum';

@Injectable()
export class PlatformSeedService {
  private readonly platformMock =
    process.env.NODE_ENV === NodeEnvEnum.DEVELOPMENT
      ? ownPlatformMockDev
      : ownPlatformMockDev; //TODO: add seed for production

  constructor(private readonly platformsService: PlatformsService) {}

  async seedPlatform() {
    try {
      const platformCount = await this.platformsService.countDocuments();
      if (platformCount > 0) return;

      const platform = compileVariablesFromJSON(this.platformMock, {
        OWN_PLATFORM_ALIAS: process.env.OWN_PLATFORM_ALIAS,
        OWN_PLATFORM_BASE_URL: process.env.OWN_PLATFORM_BASE_URL,
        OWN_PLATFORM_CLIENT_ID: process.env.OWN_PLATFORM_CLIENT_ID,
        OWN_PLATFORM_CLIENT_SECRET: process.env.OWN_PLATFORM_CLIENT_SECRET,
        OWN_PLATFORM_KEYCLOAK_ID: process.env.OWN_PLATFORM_KEYCLOAK_ID,
      });
      //Verify if the platform already exists
      const existingPlatform = await this.platformsService.findOne({
        filterOptions: {
          alias: platform.alias,
        },
        triggerError: false,
      });
      if (existingPlatform) {
        console.log(
          `Platform "${this.platformMock.name}" already exists. Skipping seed.`,
        );
        return;
      }

      // Create the platform using the PlatformsService
      await this.platformsService.createPlatform(platform);
      console.log('Platforms seeded successfully.');
    } catch (error) {
      console.error('Error seeding platforms:', error);
      throw error;
    }
  }
}
