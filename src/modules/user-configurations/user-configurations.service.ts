import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateUserConfigurationDto } from './dto/create-user-configuration.dto';
import { UpdateUserConfigurationDto } from './dto/update-user-configuration.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CRUDService } from 'src/config/database/CRUD/crud.service';
import { UserConfiguration } from './schemas/user-configuration.schema';

@Injectable()
export class UserConfigurationsService extends CRUDService<UserConfiguration> {
  constructor(
    @InjectModel(UserConfiguration.name)
    private userConfigurationModel: Model<UserConfiguration>,
    //private readonly historyService: HistoryService,
  ) {
    super(userConfigurationModel);
  }

  async createConfiguration(
    createUserConfigurationDto: CreateUserConfigurationDto,
  ) {
    const startTime = new Date();
    try {
      const newUserConfiguration = await super.create(
        createUserConfigurationDto,
      );
      // const newHistory = await this.historyService.createHistory({
      //   previousStatus: null,
      //   nextStatus: 'Created',
      //   action: {
      //     actionType: 'user-configuration-created',
      //     actionStatus: 'Created',
      //     agent: 'agentID',
      //     agentType: 'AppUser',
      //     startTime: startTime,
      //     endTime: new Date(),
      //     result: newUserConfiguration._id,
      //     resultType: 'UserConfiguration',
      //   },
      // });
      // await super.update(newUserConfiguration._id, {
      //   $push: {
      //     history: newHistory._id,
      //   },
      // });
      return newUserConfiguration;
    } catch (e) {
      console.log(e);
      // await this.historyService.createHistory({
      //   previousStatus: null,
      //   nextStatus: 'Error',
      //   action: {
      //     actionType: 'create-user-configuration',
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

  async updateConfiguration(
    updateUserConfigurationDto: UpdateUserConfigurationDto,
  ) {
    const startTime = new Date();
    try {
      const updatedUserConfiguration = await super.update(
        updateUserConfigurationDto._id,
        updateUserConfigurationDto,
      );
      // const newHistory = await this.historyService.createHistory({
      //   previousStatus: null,
      //   nextStatus: 'success',
      //   action: {
      //     actionType: 'update-user-configuration',
      //     actionStatus: 'success',
      //     agent: 'agentID',
      //     agentType: 'AppUser',
      //     startTime: startTime,
      //     endTime: new Date(),
      //     result: updatedUserConfiguration._id,
      //     resultType: 'UserConfiguration',
      //   },
      // });
      // await super.update(updatedUserConfiguration._id, {
      //   $push: {
      //     history: newHistory._id,
      //   },
      // });
      return updatedUserConfiguration;
    } catch (e) {
      console.log(e);
      // await this.historyService.createHistory({
      //   previousStatus: null,
      //   nextStatus: 'Error',
      //   action: {
      //     actionType: 'update-user-configuration',
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
}
