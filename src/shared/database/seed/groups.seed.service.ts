import { Injectable } from '@nestjs/common';
import groupsMockDev from '@/shared/database/data/seed-mocks/development-seed/groups.mock.json';
import { AppUsersService } from '@/modules/app-users/app-users.service';
import { NodeEnvEnum } from '@/shared/enums/node-env.enum';
import { GroupsService } from '@/modules/groups/groups.service';
import { normalizeString } from '@/shared/utils/utils';

@Injectable()
export class GroupsSeedService {
  private readonly groupsMock =
    process.env.NODE_ENV === NodeEnvEnum.DEVELOPMENT
      ? groupsMockDev
      : groupsMockDev; //TODO: add seed for production

  constructor(private readonly groupsService: GroupsService) {}

  async seedGroups() {
    const groupsCount = await this.groupsService.countDocuments();
    if (groupsCount > 0) return;
    try {
      await Promise.all(
        this.groupsMock.map(async (group) => {
          const storedGroup = await this.groupsService.findOne({
            filterOptions: {
              value: normalizeString(group.value),
            },
            triggerError: false,
          });
          if (storedGroup) return;

          await this.groupsService.createGroup(group);
        }),
      );

      console.log('Groups seeded successfully.');
    } catch (error) {
      console.error('Error seeding groups:', error);
      throw error;
    }
  }
}
