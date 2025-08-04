import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CRUDService } from 'src/config/database/CRUD/crud.service';
import { CustomErrorKeys } from 'src/shared/enums/error-keys.enum';
import { ConflictCustomResponse } from 'src/shared/responses/error/custom-error-response';
import { UserConfigurationsService } from '../user-configurations/user-configurations.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { HistoryService } from '../history/history.service';

@Injectable()
export class UsersService extends CRUDService<User> {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly userConfigurationsService: UserConfigurationsService,
    private readonly historyService: HistoryService,
  ) {
    super(userModel);
  }

  async createUser(createUserDto: CreateUserDto) {
    const startTime = new Date();
    try {
      const storedUser = await super.findOne({
        filterOptions: {
          $or: [
            { username: createUserDto.username, email: createUserDto.email },
          ],
        },
        triggerError: false,
      });
      if (storedUser) {
        throw new ConflictCustomResponse({
          title: 'User already exists',
          key: CustomErrorKeys.USER_ALREADY_EXISTS,
          detail: 'User with username or email already exists',
        });
      }
      //TODO: hashear password
      const newUserConfiguration =
        await this.userConfigurationsService.createConfiguration(
          createUserDto.configuration,
        );
      const newUser = await super.create({
        ...createUserDto,
        configuration: newUserConfiguration._id,
      });
      await this.historyService.createHistory(newUser);

      return newUser;
    } catch (e) {
      await this.historyService.errorHistory({
        errorMessage: e.message,
      });
      throw e;
    }
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    if (updateUserDto.configuration) {
      await this.userConfigurationsService.updateConfiguration(
        updateUserDto.configuration,
      );
    }
    const updatedUser = await super.update(updateUserDto._id, updateUserDto);
    return updatedUser;
  }


  async checkIfUserAlreadyExists(email: string, username: string) {
    const storedUser = await super.findOne({
      filterOptions: {
        $or: [{ username: username, email: email }],
      },
      triggerError: false,
    });
    return storedUser;
  }
}
