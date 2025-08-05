import { Injectable } from '@nestjs/common';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { UserGroup } from './schemas/user-group.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroupsService } from '../groups/groups.service';
import { AppUsersService } from '../app-users/app-users.service';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { AppUser } from '../app-users/schemas/app-user.schema';
import { Group } from '../groups/schemas/group.schema';
import {
  UpdateUserGroupsActionsEnum,
  UpdateUsersGroupDto,
} from './dto/update-user-group.dto';
import { filterLanguageMap } from '@/shared/utils/filter-language-map.utils';

type GroupAndCount = Group & { count: number };

@Injectable()
export class UserGroupsService extends CRUDService<UserGroup> {
  constructor(
    @InjectModel(UserGroup.name) private userGroupModel: Model<UserGroup>,
    private readonly groupsService: GroupsService,
    private readonly appUsersService: AppUsersService,
  ) {
    super(userGroupModel);
  }

  /**
   * @description Creates a new user group.
   * @author Damian
   * @date 24/07/2025
   * @param {CreateUserGroupDto} createUserGroupDto
   * @returns {*}  {Promise<UserGroup>}
   * @memberof UserGroupsService
   */
  async createUserGroup(
    createUserGroupDto: CreateUserGroupDto,
  ): Promise<UserGroup> {
    try {
      const { appUserId, groupId } = createUserGroupDto;
      //check if the group exists
      const storedGroup = await this.groupsService.findOne({
        filterOptions: {
          _id: groupId,
        },
      });
      //check if the app user exists
      const storedAppUser = await this.appUsersService.findOne({
        filterOptions: {
          _id: appUserId,
        },
      });

      //create the user group
      const newUserGroup = await super.create({
        appUser: storedAppUser._id,
        group: storedGroup._id,
      });

      return newUserGroup;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * @description Finds a user group by appUserId and groupId.
   * @author Damian
   * @date 24/07/2025
   * @param {AppUser['_id']} appUserId
   * @param {Group['_id']} groupId
   * @returns {*}
   * @memberof UserGroupsService
   */
  async findOneUserGroup(
    appUserId: AppUser['_id'],
    groupId: Group['_id'],
    triggerError = true,
  ): Promise<UserGroup | null> {
    try {
      const storedUserGroup = await this.findOne({
        filterOptions: {
          appUser: appUserId,
          group: groupId,
        },
        triggerError: triggerError,
        populateOptions: [
          {
            path: 'appUser',
            select: ['-history', '-subscriptions'],
          },
          {
            path: 'group',
            populate: ['configuration'],
            select: ['-history'],
          },
        ],
      });
      return storedUserGroup;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * @description Updates the user groups of an app user.
   * @author Damian
   * @date 24/07/2025
   * @param {AppUser['_id']} appUserId
   * @param {Group['_id'][]} groups
   * @returns {*}  {Promise<void>}
   * @memberof UserGroupsService
   */
  async updateUserGroups(
    appUserId: AppUser['_id'],
    groups: Group['_id'][],
  ): Promise<void> {
    //for each group, check if the user group exists, if not, create it and push it to the app user
    const newUserGroupIds = await Promise.all(
      groups.map(async (groupId) => {
        const storedUserGroup = await this.findOneUserGroup(
          appUserId,
          groupId,
          false,
        );
        if (!storedUserGroup) {
          const newUserGroup = await this.createUserGroup({
            appUserId: appUserId,
            groupId: groupId,
          });
          return newUserGroup._id;
        }
      }),
    );
    await this.appUsersService.update(appUserId, {
      $push: {
        userGroups: newUserGroupIds,
      },
    });
  }

  async findAllGroupsWithAppUsers(params: {
    language: string;
    paginationParams: any;
  }) {
    try {
      const { language, paginationParams } = params;

      let storedGroups = await this.groupsService.findAllGroups({
        paginationParams: paginationParams,
        lang: language,
      });

      const groupsWithCount: GroupAndCount[] = [];

      await Promise.all(
        storedGroups.map(async (group) => {
          const storedUserGroups = await this.findAll(
            {
              filterOptions: {
                group: group._id,
              },
            },
            { limit: Infinity },
          );
          groupsWithCount.push({
            ...(group as any),
            count: storedUserGroups.length,
          });
        }),
      );
      return groupsWithCount;
    } catch (e) {
      console.log(e);

      throw e;
    }
  }

  /**
   * @description This function updates the user groups of the app users.
   * @author Damian
   * @date 24/07/2025
   * @param {UpdateUsersGroupDto[]} updateUsersGroupsDto
   * @returns {*}
   * @memberof UserGroupsService
   */
  async updateUsersGroups(updateUsersGroupsDto: UpdateUsersGroupDto[]) {
    try {
      const { ADD, REMOVE } = UpdateUserGroupsActionsEnum;
      let updatedUsers = 0;
      //for each user group dto
      await Promise.all(
        updateUsersGroupsDto.map(async (updateUserGroupDto) => {
          const { action, groupId, appUserIds } = updateUserGroupDto;
          //check if the group exists
          const storedGroup = await this.groupsService.findOne({
            filterOptions: {
              _id: groupId,
            },
          });
          //then for each appUserId,
          await Promise.all(
            appUserIds.map(async (appUserId) => {
              //first, find the appUser
              const storedAppUser = await this.appUsersService.findOne({
                filterOptions: {
                  _id: appUserId,
                },
                populateOptions: [{ path: 'userGroups', populate: ['group'] }],
              });
              //if the action is add:
              if (action === ADD) {
                //if the user already has the group, skip it
                const userGroupExists = storedAppUser.userGroups.some(
                  (userGroup) => userGroup.group._id === storedGroup._id,
                );
                if (userGroupExists) return;
                // create a new user group
                const newUserGroup = await this.createUserGroup({
                  appUserId: storedAppUser._id,
                  groupId: storedGroup._id,
                });
                // add the user group to the appUser
                await this.appUsersService.update(storedAppUser._id, {
                  $push: {
                    userGroups: newUserGroup._id,
                  },
                });
                updatedUsers++;
              }
              //if the action is remove:
              else if (action === REMOVE) {
                // get the user group
                const storedUserGroup = await this.findOne({
                  filterOptions: {
                    appUser: storedAppUser._id,
                    group: storedGroup._id,
                  },
                  triggerError: false,
                });
                if (!storedUserGroup) return;
                // remove the user group from the appUser
                await this.appUsersService.update(storedAppUser._id, {
                  $pull: {
                    userGroups: storedUserGroup._id,
                  },
                });
                // and finally delete the user group
                await this.remove(storedUserGroup._id);
                updatedUsers++;
              }
            }),
          );
        }),
      );
      return {
        message: 'User groups updated successfully',
        updatedUsers: updatedUsers,
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async findAppUsersByGroup(params: {
    language: string;
    paginationParams: any;
    filterOptions?: any;
  }): Promise<AppUser[]> {
    try {
      const { language, paginationParams, filterOptions } = params;
      let storedAppUsers = await this.appUsersService.findAll(
        {
          populateOptions: [
            { path: 'userGroups', populate: ['group'] },
            'user',
          ],
        },
        paginationParams,
      );

      if (filterOptions?.group) {
        storedAppUsers = storedAppUsers.filter((appUser) => {
          const matches = appUser.userGroups.some((userGroup) => {
            return userGroup.group._id === filterOptions.group;
          });
          return matches;
        });
      }

      if (filterOptions.not) {
        storedAppUsers = storedAppUsers.filter((appUser) => {
          const matches = !appUser.userGroups.some((userGroup) => {
            return userGroup.group._id === filterOptions.not;
          });
          return matches;
        });
      }

      if (language) {
        return filterLanguageMap(
          storedAppUsers.map((appUser) => appUser.toObject()),
          language,
        );
      }
      return storedAppUsers;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
