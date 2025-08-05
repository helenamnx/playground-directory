import { CRUDService } from '@/config/database/CRUD/crud.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { CreateAppUserDto } from './dto/create-app-user.dto';
import { UpdateAppUserDto } from './dto/update-app-user.dto';
import { AppUser } from './schemas/app-user.schema';
import { Model } from 'mongoose';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { HistoryService } from '../history/history.service';
import { ModerationStatusService } from '../moderation-status/moderation-status.service';
import { ModerationStatusAliasEnum } from '@/shared/enums/moderation-status.enum';
import { ModerationStatus } from '../moderation-status/schemas/moderation-status.schema';
import { UserModerationHistoryService } from '../user-moderation-history/user-moderation-history.service';
import { UserModerationHistory } from '../user-moderation-history/schemas/user-moderation-history.schema';
import { LanguageMap } from '@/shared/types/language-map.type';
import {
  getAvailableModerationActions,
  getLastArrayItem,
  isUserAdmin,
  normalizeUsername,
} from '@/shared/utils/utils';
import { ContactPointsService } from '../contact-points/contact-points.service';
import { JobsService } from '../jobs/jobs.service';
import { PostalAddressesService } from '../postal-addresses/postal-addresses.service';
import { newFilterLanguageMap } from '@/shared/utils/filter-language-map.utils';

@Injectable()
export class AppUsersService extends CRUDService<AppUser> {
  private readonly cryptoSecretKey: string;
  constructor(
    @InjectModel(AppUser.name) private appUserModel: Model<AppUser>,
    private readonly userService: UsersService,
    private readonly historyService: HistoryService,
    private readonly configService: ConfigService,
    private readonly alsService: AsyncStorageService,
    private readonly userModerationStatusHistoryService: UserModerationHistoryService,
    private readonly contactPointsService: ContactPointsService,
    private readonly postalAddressesService: PostalAddressesService,
    private readonly jobsService: JobsService,
    private readonly moderationStatusService: ModerationStatusService,
  ) {
    super(appUserModel);
    this.cryptoSecretKey = this.configService.get<string>(
      'crypto.CRYPTO_SECRET_KEY',
    );
  }

  async createAppUser(createAppUserDto: CreateAppUserDto) {
    const startTime = new Date();
    try {
      //if groups passed, find the groups
      // if (createAppUserDto.groups && createAppUserDto.groups.length > 0) {
      //   await this.groupsService.findGroups(createAppUserDto.groups);
      // }

      //create the contactPoints
      let newContactPointIds: string[] = [];
      if (createAppUserDto.contactPoints) {
        newContactPointIds = await Promise.all(
          createAppUserDto.contactPoints.map(async (contactPoint) => {
            const newContactPoint =
              await this.contactPointsService.createContactPoint(contactPoint);
            return newContactPoint._id;
          }),
        );
      }

      //create the postalAddress if it exists
      let newPostalAddressId: string = null;
      if (createAppUserDto.address) {
        const newPostalAddress =
          await this.postalAddressesService.createPostalAddress(
            createAppUserDto.address,
          );
        newPostalAddressId = newPostalAddress._id;
      }

      //create the job relationship if it exists
      let storedJobId: string = null;
      if (createAppUserDto.job !== '' && createAppUserDto.job) {
        const storedJob = await this.jobsService.findOne({
          filterOptions: {
            value: createAppUserDto.job,
          },
          triggerError: false,
        });
        if (!storedJob) {
          const newJob = await this.jobsService.create({
            value: createAppUserDto.job,
          });
          storedJobId = newJob._id;
        } else {
          storedJobId = storedJob._id;
        }
      }
      //create the user in the database
      const newUser = await this.userService.createUser(createAppUserDto.user);
      //create the app user in the database
      const newAppUser = await super.create({
        ...createAppUserDto,
        user: newUser._id,
        contactPoints: newContactPointIds,
        address: newPostalAddressId,
        job: storedJobId,
      });
      const storedAppUser = await super.findOne({
        filterOptions: {
          _id: newAppUser._id,
        },
        populateOptions: ['user'],
      });
      // await this.historyService.createHistory({
      //   entity: storedAppUser,
      // });
      return storedAppUser;
    } catch (e) {
      console.log(e);
      // await this.historyService.errorHistory({
      //   errorMessage: e.message,
      // });
      throw e;
    }
  }
  async updateAppUser(updateAppUserDto: UpdateAppUserDto) {
    const startTime = new Date();
    try {
      if (updateAppUserDto.user) {
        await this.userService.updateUser(updateAppUserDto.user);
      }
      const updatedAppUser = await super.update(
        updateAppUserDto._id,
        updateAppUserDto,
      );
      // await this.historyService.updateHistory({
      //   entity: updatedAppUser,
      // });
      return updatedAppUser;
    } catch (e) {
      console.log(e);
      // await this.historyService.errorHistory({
      //   errorMessage: 'asd',
      //   actionType: 'update-app-user',
      // });
      throw e;
    }
  }

  async findByUserCredentials(credential: string) {
    try {
      const storedUser = await this.userService.findOne({
        filterOptions: {
          $or: [
            { username: normalizeUsername(credential) },
            { email: credential },
          ],
        },
      });
      const storedAppUser = await this.findOne({
        filterOptions: { user: storedUser._id },
        populateOptions: [
          {
            path: 'user',
            select: ['-password', '-history'],
            populate: ['roles'],
          },
          {
            path: 'userGroups',
            populate: [{ path: 'group', populate: ['configuration'] }],
          },

          {
            path: 'moderationStatusHistory',
            select: ['-history'],
            populate: 'moderationStatus',
          },
        ],
        selectOptions: ['-history'],
      });
      return storedAppUser;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateLastLogin(id: User['_id']) {
    await this.userService.updateUser({ _id: id, lastLogin: new Date() });
    return;
  }

  /**
   * @description This function checks if the an user with the provided parameters is already registered.
   * @author Damian
   * @date 10/06/2025
   * @param {string} username
   * @param {string} email
   * @param {string} dni
   * @param {string} memberNumber
   * @returns {*}  {Promise<boolean>}
   * @memberof AppUsersService
   */
  async isUserAlreadyRegistered(params: {
    username?: string;
    email?: string;
    dni?: string;
    memberNumber?: string;
  }): Promise<boolean> {
    const { email, username, dni, memberNumber } = params;
    if (memberNumber) {
      const storedAppUser = await this.findOne({
        filterOptions: {
          memberNumber: memberNumber,
        },
        triggerError: false,
      });
      if (storedAppUser) {
        if (!storedAppUser.memberNumber) return false;
        return true;
      }
    }

    //TODO: check if the memberNumber is required and unique
    if (dni) {
      const storedAppUser = await this.findOne({
        filterOptions: {
          'legalDocumentation.DNI': dni,
        },
        triggerError: false,
      });
      if (storedAppUser) return true;
    }

    const storedUser = await this.userService.findOne({
      filterOptions: {
        $or: [
          { email: email },
          { username: username ? normalizeUsername(username) : null },
        ],
      },
      triggerError: false,
    });
    if (storedUser) return true;
    return false;
  }

  /**
   * @description This function adds a new moderation status to the app user with the provided ID.
   * @author Damian
   * @date 10/06/2025
   * @param {string} appUserId
   * @param {ModerationStatusEnum} moderationStatus
   * @param {observation} observation
   * @returns {*}
   * @memberof AppUsersService
   */
  async addNewModerationStatus(
    appUserId: string,
    moderationStatus: ModerationStatusAliasEnum,
    observation?: LanguageMap,
  ): Promise<UserModerationHistory> {
    const newModerationStatus =
      await this.userModerationStatusHistoryService.createUserModerationHistory(
        {
          moderationStatusAlias: moderationStatus,
          observation: observation,
        },
      );
    await super.update(appUserId, {
      $push: {
        moderationStatusHistory: newModerationStatus._id,
      },
    });
    return newModerationStatus;
  }

  // async saveSubscription(body) {
  //   const storedAppUser = await super.findOne({
  //     filterOptions: { _id: body.userId },
  //     populateOptions: ['subscriptions'],
  //   });
  //   let subscription = storedAppUser.subscriptions.find(
  //     (subscription) => subscription.endpoint === body.subscription.endpoint,
  //   );
  //   if (subscription) {
  //     subscription = await this.subscriptionService.update(subscription._id, {
  //       ...body.subscription,
  //     });
  //     return subscription;
  //   } else {
  //     const newSubscription = await this.subscriptionService.create({
  //       ...body.subscription,
  //     });
  //     await super.update(storedAppUser._id, {
  //       $push: {
  //         subscriptions: newSubscription._id,
  //       },
  //     });
  //     return newSubscription;
  //   }
  // }

  /**
   * @description This function returns all the app users. It can be filtered by moderation status.
   * @author Damian
   * @date 12/06/2025
   * @param {string} [moderationStatus]
   * @returns {*}
   * @memberof AppUsersService
   */
  async findAllAppUsers(params: {
    appUser: AppUser;
    filterOptions?: any;
    paginationParams?: any;
    moderationStatus?: string;
    language?: string;
  }): Promise<AppUser[]> {
    //TODO: refactor
    const {
      filterOptions,
      paginationParams,
      moderationStatus,
      language,
      appUser,
    } = params;
    const storedAppUsers = await super.findAll(
      {
        populateOptions: [
          {
            path: 'userGroups',
            populate: [{ path: 'group', populate: ['configuration'] }],
          },
          {
            path: 'user',
            select: ['-history', '-alias', '-configuration', '-externalIds'],
            populate: [
              {
                path: 'roles',
                select: ['-history', '-serviceId', '-externalId'],
              },
            ],
          },
          {
            path: 'moderationStatusHistory',
            select: ['-history'],
            populate: { path: 'moderationStatus', select: ['-history'] },
          },
        ],
        selectOptions: ['-history', '-subscriptions'],
      },
      paginationParams,
    );

    //return only the last moderation status by default
    let appUsersWithLastStatusHistory = storedAppUsers.map((appUser) => {
      const lastModeration = getLastArrayItem(appUser.moderationStatusHistory);

      return {
        ...appUser.toObject(),
        moderationStatusHistory: lastModeration,
      };
    });
    //if moderation status is provided, filter the app users where the moderation status matches
    if (moderationStatus) {
      appUsersWithLastStatusHistory = appUsersWithLastStatusHistory.filter(
        (appUser) => {
          return (
            appUser.moderationStatusHistory?.moderationStatus.alias ===
            moderationStatus
          );
        },
      );
    }
    //if the appUser is admin, return the possible actions for the moderation status
    if (isUserAdmin(appUser)) {
      const storedModerationStatuses =
        await this.moderationStatusService.findAll({}, { limit: Infinity });
      return appUsersWithLastStatusHistory.map((appUser: any) => {
        if (!appUser.moderationStatusHistory) return appUser;
        const availableModerationActions = getAvailableModerationActions(
          appUser.moderationStatusHistory.moderationStatus,
        );
        const moderationStatuses = storedModerationStatuses.filter(
          (moderationStatus) =>
            availableModerationActions.includes(moderationStatus.alias),
        );
        return {
          ...appUser,
          availableModerationStatuses: moderationStatuses,
        };
      });
    }

    return appUsersWithLastStatusHistory;
  }

  /**
   * @description This function returns an app user by its id. Returns last moderation status by default
   * @author Damian
   * @date 12/06/2025
   * @param {AppUser['_id']} id
   * @returns {*}
   * @memberof AppUsersService
   */
  async findOneAppUserById(id: AppUser['_id']) {
    const storedAppUser = await super.findOne({
      filterOptions: {
        _id: id,
      },
      populateOptions: [
        {
          path: 'user',
          select: ['-history', '-alias', '-configuration', '-externalIds'],
          populate: [
            {
              path: 'roles',
              select: ['-history', '-serviceId', '-externalId'],
            },
          ],
        },
        {
          path: 'moderationStatusHistory',
          select: ['-history'],
          populate: { path: 'moderationStatus', select: ['-history'] },
        },
      ],
      selectOptions: ['-history', '-subscriptions'],
    });

    const lastModeration = getLastArrayItem(
      storedAppUser.moderationStatusHistory,
    );

    return {
      ...storedAppUser.toObject(),
      moderationStatusHistory: lastModeration,
    } as AppUser;
  }

  async countDocuments() {
    return this.appUserModel.countDocuments();
  }
}
