import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Group } from './schemas/group.schema';
import { Model } from 'mongoose';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import {
  BadRequestCustomResponse,
  ConflictCustomResponse,
} from '@/shared/responses/error/custom-error-response';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import {
  normalizeString,
  transformToLanguageMapType,
} from '@/shared/utils/utils';
import { filterLanguageMap } from '@/shared/utils/filter-language-map.utils';

import { UserGroup } from '../user-groups/schemas/user-group.schema';
import { ExamConfiguration } from '../exam-configurations/schemas/exam-configuration.schema';
import { GroupConfigurationsService } from '../group-configurations/group-configurations.service';
type GroupAndCount = Group & { count: number };

@Injectable()
export class GroupsService extends CRUDService<Group> {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    @InjectModel(ExamConfiguration.name)
    private examConfigurationModel: Model<ExamConfiguration>,
    @InjectModel(UserGroup.name)
    private readonly userGroupModel: Model<UserGroup>,
    private readonly groupConfigurationService: GroupConfigurationsService,
  ) {
    super(groupModel);
  }

  async createGroup(createGroupDto: CreateGroupDto) {
    try {
      const { type, value, name, configuration } = createGroupDto;
      const storedGroup = await super.findOne({
        filterOptions: {
          value: normalizeString(value),
          type: type,
        },
        triggerError: false,
      });
      if (storedGroup) {
        throw new ConflictCustomResponse({
          title: 'Group already exists',
          key: CustomErrorKeys.GROUP_ALREADY_EXISTS,
          detail: 'Group already exists',
        });
      }

      const newGroupConfiguration =
        await this.groupConfigurationService.createGroupConfiguration(
          configuration,
        );

      const newGroup = await super.create({
        ...createGroupDto,
        value: normalizeString(value),
        name: transformToLanguageMapType(name),
        configuration: newGroupConfiguration._id,
      });
      //TODO: add history
      return newGroup;
    } catch (error) {
      throw error;
    }
  }

  async findAllGroups(params: {
    filterOptions?: any;
    paginationParams?: any;
    lang?: string;
  }) {
    const { filterOptions, paginationParams, lang } = params || {};
    let allGroups = await super.findAll(
      {
        selectOptions: ['-history'],
        populateOptions: ['configuration'],
      },
      paginationParams,
    );
    const groupWithCount: GroupAndCount[] = await Promise.all(
      allGroups.map(async (group) => {
        const usersInGroup = await this.userGroupModel.countDocuments({
          group: group._id,
        });

        return {
          ...group.toObject(),
          count: usersInGroup,
        };
      }),
    );
    if (lang) {
      return groupWithCount.map((group) => filterLanguageMap(group, lang));
    }

    return groupWithCount;
  }

  async findOneGroup(id: Group['_id'], lang?: string) {
    const group = await super.findOne({
      filterOptions: {
        _id: id,
      },
      selectOptions: ['-history'],
      populateOptions: ['configuration'],
    });
    if (lang) {
      return filterLanguageMap(group.toObject(), lang);
    }

    return group;
  }

  async findGroups(groupsIds: Group['_id'][]): Promise<Group[]> {
    const storedGroups = await super.findAll({
      filterOptions: { _id: { $in: groupsIds } },
      selectOptions: ['-history'],
      populateOptions: ['configuration'],
    });

    return storedGroups;
  }

  async deleteGroup(groupId: string) {
    try {
      const userGroupsCount = await this.userGroupModel.countDocuments({
        group: groupId,
      });
      if (userGroupsCount > 0) {
        throw new BadRequestCustomResponse({
          title: 'Group is not empty',
          key: CustomErrorKeys.GROUP_HAS_USERS,
          detail: 'Group already has users',
        });
      }

      const examsCount = await this.examConfigurationModel.countDocuments({
        groups: groupId,
      });
      if (examsCount > 0) {
        throw new BadRequestCustomResponse({
          title: 'Group is not empty',
          key: CustomErrorKeys.GROUP_HAS_EXAMS,
          detail: 'Group already has exams',
        });
      }
      //find the group and remove the configuration, and then delete the group
      const storedGroup = await this.findOne({
        filterOptions: {
          _id: groupId,
        },
        populateOptions: ['configuration'],
      });
      await this.groupConfigurationService.remove(
        storedGroup.configuration._id,
      );
      return this.remove(groupId);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async updateGroup(updateGroupDto: UpdateGroupDto) {
    try {
      const { _id, name, configuration } = updateGroupDto;
      const storedGroup = await super.findOne({
        filterOptions: {
          _id: _id,
        },
        populateOptions: ['configuration'],
      });

      if (configuration) {
        await this.groupConfigurationService.update(
          storedGroup.configuration._id,
          configuration,
        );
      }

      delete updateGroupDto.configuration;
      return super.update(_id, {
        ...updateGroupDto,
        name: name ? transformToLanguageMapType(name) : storedGroup.name,
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async countDocuments() {
    return this.groupModel.countDocuments();
  }
}
