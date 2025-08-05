import { Injectable } from '@nestjs/common';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { UserRole } from './schemas/user-role.schemas';
import { Model } from 'mongoose';
import { ConflictCustomResponse } from '@/shared/responses/error/custom-error-response';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { filterLanguageMap } from '@/shared/utils/filter-language-map.utils';

@Injectable()
export class UserRolesService extends CRUDService<UserRole> {
  constructor(
    @InjectModel(UserRole.name) private userRoleModel: Model<UserRole>,
  ) {
    super(userRoleModel);
  }

  async createUserRole(createUserRoleDto: CreateUserRoleDto) {
    try {
      //TODO: create permissions and check parents if provided
      const newRole = await this.create(createUserRoleDto);
      //TODO: add history
      return newRole;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * @description This function checks if the provided roles already exist in the database.
   * @author Damian
   * @date 13/06/2025
   * @param {UserRole['_id'][]} roleIds
   * @memberof UserRolesService
   * @returns {Promise<UserRole[]>}
   */
  async findRoles(roleIds: UserRole['_id'][]): Promise<UserRole[]> {
    const storedRoles = await Promise.all(
      roleIds.map((roleId) => {
        return this.findOne({
          filterOptions: { _id: roleId },
        });
      }),
    );
    return storedRoles;
  }

  async findAllRoles(params: {
    filterOptions?: any;
    paginationParams?: any;
    lang?: string;
  }) {
    const { filterOptions, paginationParams, lang } = params || {};
    const allRoles = await super.findAll(
      {
        selectOptions: ['-history', '-serviceId', '-externalId'],
      },
      paginationParams,
    );

    if (lang) {
      return allRoles.map((item) => filterLanguageMap(item.toJSON(), lang));
    }

    return allRoles;
  }

  async findOneByID(id: string, lang?: string): Promise<UserRole> {
    const storedRole = await super.findOne({
      filterOptions: {
        _id: id,
      },
      populateOptions: [
        { path: 'permissions', populate: 'name' },
        { path: 'parents', populate: 'externalId' },
      ],
    });
    if (lang) {
      return filterLanguageMap(storedRole.toJSON(), lang);
    }
    return storedRole;
  }

  async countDocuments() {
    return this.userRoleModel.countDocuments();
  }
}
