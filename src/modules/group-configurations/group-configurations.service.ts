import { Injectable } from '@nestjs/common';
import { CreateGroupConfigurationDto } from './dto/create-group-configuration.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroupConfiguration } from './schemas/group-configuration.schema';
@Injectable()
export class GroupConfigurationsService extends CRUDService<GroupConfiguration> {
  constructor(
    @InjectModel(GroupConfiguration.name)
    private groupConfigurationModel: Model<GroupConfiguration>,
  ) {
    super(groupConfigurationModel);
  }

  async createGroupConfiguration(
    createGroupConfigurationDto: CreateGroupConfigurationDto,
  ) {
    try {
      const newGroupConfiguration = await super.create({
        ...createGroupConfigurationDto,
      });
      return newGroupConfiguration;
    } catch (error) {
      throw error;
    }
  }
}
