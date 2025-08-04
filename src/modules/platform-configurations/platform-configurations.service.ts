import { Injectable } from '@nestjs/common';
import { UpdatePlatformConfigurationDto } from './dto/update-platform.dto';
import { CreatePlatformConfigurationDto } from './dto/create-platform.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { platformMock } from '@/shared/mocks/platform.mock';
import { generateUUID } from '@/shared/utils/generate-uuid.util';
import { InjectModel } from '@nestjs/mongoose';
import { HistoryService } from '../history/history.service';
import { PlatformConfiguration } from './entities/platform-configuration.entity';
import { Model } from 'mongoose';

@Injectable()
export class PlatformConfigurationsService extends CRUDService<PlatformConfiguration> {
  constructor(
    @InjectModel(PlatformConfiguration.name)
    private readonly platformConfigurationModel: Model<PlatformConfiguration>,
    private readonly historyService: HistoryService,
  ) {
    super(platformConfigurationModel);
  }

  async createPlatformConfiguration(
    createPlatformConfigurationDto: CreatePlatformConfigurationDto,
  ) {
    try {
      let menuOptions = createPlatformConfigurationDto.menuOptions.map(
        (menuOption) => {
          return {
            _id: generateUUID(),
            ...menuOption,
          };
        },
      );
      const newPlatformConfiguration = this.create({
        isActive: createPlatformConfigurationDto.isActive,
        theme: createPlatformConfigurationDto.theme,
        menuOptions: menuOptions,
      });
      return newPlatformConfiguration;
    } catch (error) {
      throw error;
    }
  }

  findAllPlatformsConfigurations() {
    return platformMock.configuration;
  }

  findOnePlatformsConfiguration(id: number) {
    return platformMock.configuration;
  }

  async updatePlatformConfiguration(
    updatePlatformConfigurationDto: UpdatePlatformConfigurationDto,
  ) {
    const startTime = new Date();
    try {
      const updatedPlatformConfiguration = await this.update(
        updatePlatformConfigurationDto._id,
        {
          ...updatePlatformConfigurationDto,
        },
      );
      // TODO: add history
      // const newHistory = await this.historyService.createHistoryRecord({
      //   entity: updatedPlatformConfiguration,
      //   actionType: 'update-platform-configuration',
      //   actionStatus: 'success',
      //   nextStatus: 'updated',
      // });

      //TODO: add history to the platform
      return updatedPlatformConfiguration;
    } catch (error) {
      // await this.historyService.errorHistory({
      //   errorMessage: error.message,
      //   entity: updatePlatformConfigurationDto,
      //   actionType: 'update-platform-configuration',
      // });
      //TODO: add history to the platform
      throw error;
    }
  }

  removePlatformConfiguration(id: number) {
    return `This action removes a #${id} platformConfiguration`;
  }
}
