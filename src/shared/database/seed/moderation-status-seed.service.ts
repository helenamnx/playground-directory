import { Injectable } from '@nestjs/common';
import { ModerationStatusService } from '@/modules/moderation-status/moderation-status.service';
import moderationStatusMockDev from '@/shared/database/data/seed-mocks/development-seed/moderation-status.mock.json';
import statusesMockDev from '@/shared/database/data/seed-mocks/development-seed/statuses.mock.json';
import { StatusesService } from '@/modules/statuses/statuses.service';
import { NodeEnvEnum } from '@/shared/enums/node-env.enum';
@Injectable()
export class ModerationStatusSeedService {
  private readonly moderationStatusMock =
    process.env.NODE_ENV === NodeEnvEnum.DEVELOPMENT
      ? moderationStatusMockDev
      : moderationStatusMockDev; //TODO: add seed for production
  private readonly statusesMock =
    process.env.NODE_ENV === NodeEnvEnum.DEVELOPMENT
      ? statusesMockDev
      : statusesMockDev; //TODO: add seed for production

  constructor(
    private readonly moderationStatusService: ModerationStatusService,
    private readonly statusesService: StatusesService,
  ) {}

  async seedModerationStatus() {
    try {
      const moderationStatusCount =
        await this.moderationStatusService.countDocuments();
      if (moderationStatusCount > 0) return;

      // Create the moderation statuses
      await Promise.all(
        this.moderationStatusMock.map(async (moderationStatus) => {
          await this.moderationStatusService.createModerationStatus(
            moderationStatus,
          );
        }),
      );

      // Create the statuses
      await Promise.all(
        this.statusesMock.map(async (status) => {
          await this.statusesService.create(status);
        }),
      );

      console.log('Moderation Statuses seeded successfully.');
    } catch (error) {
      console.error('Error seeding moderation status:', error);
      throw error;
    }
  }
}
