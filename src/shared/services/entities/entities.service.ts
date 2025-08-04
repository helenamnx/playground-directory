import { Injectable } from '@nestjs/common';
import { CustomErrorKeys } from '../../enums/error-keys.enum';
import { UnauthorizedCustomResponse } from '../../responses/error/custom-error-response';
import { CustomErrorResponse } from '../../responses/error/custom-error-response.class';
import { AsyncStorageService } from '../als/als.service';
import { User } from '@/modules/users/schemas/user.schema';
import { UsersService } from '@/modules/users/users.service';
import { AppUsersService } from '@/modules/app-users/app-users.service';

@Injectable()
export class EntitiesService {
  constructor(
    private readonly usersService: UsersService,
    private readonly alsService: AsyncStorageService,
    private readonly appUserService: AppUsersService,
  ) {}

  //this function is used to find the entity by the role of the user
  //is used on  the user token hook service
  async findEntityByRole(userRole: string, kcId: string) {
     try {
      const storedUser = await this.usersService.findOne({
       filterOptions: {
        externalIds: {
          $elemMatch: {
            kcID: kcId,
          },
        },
      },
      });
      this.alsService.set('user', storedUser);
      switch (userRole.toLowerCase()) {
        case 'admin': {
          await this.setAppUser(storedUser);

          break;
        }

        default:
          throw new UnauthorizedCustomResponse({
            title: 'Invalid user role',
            detail: 'User role is not valid',
            key: CustomErrorKeys.INVALID_USER_ROLE,
          });
      }
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  private async setAppUser(storedUser: User) {
    const storedAppUser = await this.appUserService.findOne({
      filterOptions: { user: storedUser._id },
      populateOptions: ['user'],
    });
    this.alsService.set('visitor', storedAppUser);
  }
}
