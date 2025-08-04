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

@Injectable()
export class AppUsersService extends CRUDService<AppUser> {
  private readonly cryptoSecretKey: string;
  constructor(
    @InjectModel(AppUser.name) private appUserModel: Model<AppUser>,
    private readonly userService: UsersService,
    private readonly historyService: HistoryService,
    private readonly configService: ConfigService,
    private readonly alsService: AsyncStorageService,
  ) {
    super(appUserModel);
    this.cryptoSecretKey = this.configService.get<string>(
      'crypto.CRYPTO_SECRET_KEY',
    );
  }

 

  async createAppUser(createAppUserDto: CreateAppUserDto) {
    const startTime = new Date();
    try {
      const newUser = await this.userService.createUser(createAppUserDto.user);
      const newAppUser = await super.create({
        ...createAppUserDto,
        user: newUser._id,
      });
      const storedAppUser = await this.findOne({
        filterOptions: {
          _id: newAppUser._id,
        },
        populateOptions: ['user'],
      });
      const newHistory = await this.historyService.createHistoryRecord({
        entity: newAppUser,
        actionType: 'create',
        actionStatus: 'success',
        nextStatus: 'created',
      });
      await super.update(newAppUser._id, {
        $push: {
          history: newHistory._id,
        },
      });
      return storedAppUser;
    } catch (e) {
      console.log(e);
      const errorHistory = await this.historyService.createHistoryRecord({
        entity: null,
        actionType: 'create',
        actionStatus: 'error',
        nextStatus: 'error',
        errorMessage: e.message,
      });
      throw e;
    }
  }
  async updateAppUser(updateAppUserDto: UpdateAppUserDto) {
    const startTime = new Date();
    try {
      await this.userService.updateUser(updateAppUserDto.user);
      const updatedAppUser = await super.update(
        updateAppUserDto._id,
        updateAppUserDto,
      );
      // const newHistory = await this.historyService.createHistory({
      //   previousStatus: null,
      //   nextStatus: 'success',
      //   action: {
      //     actionType: 'update-app-user',
      //     actionStatus: 'success',
      //     agent: 'agentID',
      //     agentType: 'AppUser',
      //     startTime: startTime,
      //     endTime: new Date(),
      //     result: updatedAppUser._id,
      //     resultType: 'AppUser',
      //   },
      // });
      // await super.update(updatedAppUser._id, {
      //   $push: {
      //     history: newHistory._id,
      //   },
      // });
      return updatedAppUser;
    } catch (e) {
      console.log(e);
      // await this.historyService.createHistory({
      //   previousStatus: null,
      //   nextStatus: 'Error',
      //   action: {
      //     actionType: 'update-app-user',
      //     actionStatus: 'Error',
      //     agent: 'agentID',
      //     agentType: 'AppUser',
      //     startTime: startTime,
      //     endTime: new Date(),
      //     error: e.message,
      //   },
      // });
      throw e;
    }
  }

  async findByUserCredentials(credential: string) {
    const storedUser = await this.userService.findOne({
      filterOptions: {
        $or: [{ username: credential }, { email: credential }],
      },
    });
    const storedAppUser = await this.findOne({
      filterOptions: { user: storedUser._id },
      populateOptions: [{ path: 'user', select: ['-password', '-history'] }],
      selectOptions: ['-history'],
    });
    return storedAppUser;
  }

  async updateLastLogin(id: User['_id']) {
    await this.userService.updateUser({ _id: id, lastLogin: new Date() });
    return;
  }
  async checkIfUserAlreadyExists(email: string, username: string) {
    const storedUser = await this.userService.findOne({
      filterOptions: {
        $or: [{ username: username, email: email }],
      },
      triggerError: false,
    });
    return storedUser;
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
}
