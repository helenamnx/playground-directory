import { Injectable } from '@nestjs/common';
import appUsersMockDev from '@/shared/database/data/seed-mocks/development-seed/app-users.mock.json';
import appUsersMockProd from '@/shared/database/data/seed-mocks/production-seed/app-users.mock.json';
import { AppUsersService } from '@/modules/app-users/app-users.service';
import { NodeEnvEnum } from '@/shared/enums/node-env.enum';
import { ModerationStatusAliasEnum } from '@/shared/enums/moderation-status.enum';
import { UserGroupsService } from '@/modules/user-groups/user-groups.service';

@Injectable()
export class AppUsersSeedService {
  private readonly appUsersMock =
    process.env.NODE_ENV === NodeEnvEnum.DEVELOPMENT
      ? appUsersMockDev
      : appUsersMockProd;

  constructor(
    private readonly appUsersService: AppUsersService,
    private readonly userGroupsService: UserGroupsService,
  ) {}

  async seedAppUsers() {
    try {
      const appUsersCount = await this.appUsersService.countDocuments();
      if (appUsersCount > 0) return;
      await Promise.all(
        this.appUsersMock.map(async (appUser) => {
          const storedAppUser = await this.appUsersService.findOne({
            filterOptions: {
              name: appUser.name,
            },
            triggerError: false,
          });
          if (storedAppUser) return;

          const newAppUser = await this.appUsersService.createAppUser(appUser);
          if (appUser.groups && appUser.groups.length > 0) {
            await this.userGroupsService.updateUserGroups(
              newAppUser._id,
              appUser.groups,
            );
          }
          //TODO: quitar string mágico

          if (appUser.user.email !== 'uoapp@admin.com') {
            await this.appUsersService.addNewModerationStatus(
              newAppUser._id,
              ModerationStatusAliasEnum.USER_ACTIVATED,
            );
          }
        }),
      );

      console.log('App users seeded successfully.');
    } catch (error) {
      console.error('Error seeding app users:', error);
      throw error;
    }
  }
}
