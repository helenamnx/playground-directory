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
import { UserRolesService } from '../user-roles/user-roles.service';
import { UserRole } from '../user-roles/schemas/user-role.schemas';

@Injectable()
export class UsersService extends CRUDService<User> {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly userConfigurationsService: UserConfigurationsService,
    private readonly userRolesService: UserRolesService,
    private readonly historyService: HistoryService,
  ) {
    super(userModel);
  }

  async createUser(createUserDto: CreateUserDto) {
    const startTime = new Date();
    try {
      const {
        roles,
        email,
        username,
        configuration,
        externalIds,
        displayName,
      } = createUserDto;
      if (roles?.length > 0) {
        await this.userRolesService.findRoles(roles);
      }
      const storedUser = await super.findOne({
        filterOptions: {
          $or: [{ username: username, email: email }],
        },
        triggerError: false,
      });
      if (storedUser) {
        throw new ConflictCustomResponse({
          title: 'User already exists',
          key: CustomErrorKeys.USER_ALREADY_EXISTS,
          detail: `User with username or email already exists: username: ${username}, email: ${email}`,
        });
      }
      //TODO: hashear password
      const newUserConfiguration =
        await this.userConfigurationsService.createConfiguration(configuration);
      const newUser = await super.create({
        ...createUserDto,
        configuration: newUserConfiguration._id,
        alias: email,
        displayName: displayName || email,
      });
      // await this.historyService.createHistory(newUser);

      return newUser;
    } catch (e) {
      // await this.historyService.errorHistory({
      //   errorMessage: e.message,
      // });
      console.log(e);
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

  /**
   * @description This function return an user if the provided email or username exists.
   * @author Damian
   * @date 13/06/2025
   * @param {string} email
   * @param {string} username
   * @returns {*}
   * @memberof UsersService
   */
  async checkIfUserAlreadyExists(
    email: string,
    username: string,
  ): Promise<User | undefined> {
    const storedUser = await super.findOne({
      filterOptions: {
        $or: [{ username: username, email: email }],
      },
      triggerError: false,
    });
    return storedUser;
  }

  /**
   * @description This function add roles to an user
   * @author Damian
   * @date 13/06/2025
   * @param {User} user
   * @param {UserRole['_id'][]} roles
   * @memberof UsersService
   */
  async addRolesToUser(userId: User['_id'], roles: UserRole['_id'][]) {
    const storedRoles = await this.userRolesService.findRoles(roles);
    await super.update(userId, {
      $addToSet: {
        roles: storedRoles.map((role) => role._id),
      },
    });
  }

  async getUserRoles(userId: User['_id']) {
    const storedUser = await super.findOne({
      filterOptions: {
        _id: userId,
      },
      populateOptions: [
        {
          path: 'roles',
          select: ['-history'],
        },
      ],
    });
    return storedUser.roles;
  }

  async updateUserRoles(userId: User['_id'], roles: UserRole['_id'][]) {
    const storedRoles = await this.userRolesService.findRoles(roles);
    await super.update(userId, {
      $set: {
        roles: storedRoles.map((role) => role._id),
      },
    });
  }
}
