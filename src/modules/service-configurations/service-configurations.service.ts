import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceConfiguration } from './schemas/service-configuration.schema';
import { CRUDService } from 'src/config/database/CRUD/crud.service';
import { CreateServiceConfigurationDto } from './dto/create-service-configuration.dto';
import { ActionSpecificationsService } from '../action-specifications/action-specifications.service';
import { ActionSpecification } from '../action-specifications/schemas/action-specification.schema';
import { UpdateServiceConfigurationDto } from './dto/update-service-configuration.dto';

@Injectable()
export class ServiceConfigurationsService extends CRUDService<ServiceConfiguration> {
  constructor(
    @InjectModel(ServiceConfiguration.name)
    private serviceConfigurationModel: Model<ServiceConfiguration>,
    private readonly actionsSpecificationsService: ActionSpecificationsService,
  ) {
    super(serviceConfigurationModel);
  }
  async create(createServiceConfigurationDto: CreateServiceConfigurationDto) {
    //TODO: Validation and error handling

    let actionSpecificationsIds: string[] = [];
    if (createServiceConfigurationDto.servicesEntrypoints) {
      const actionSpecifications =
        await this.actionsSpecificationsService.createActionSpecifications(
          createServiceConfigurationDto.servicesEntrypoints,
        );
      actionSpecificationsIds = actionSpecifications.map(
        (actionSpecification) => actionSpecification._id,
      );
    }

    const newServiceConfiguration = await super.create({
      ...createServiceConfigurationDto,
      servicesEntrypoints: actionSpecificationsIds,
    });
    return newServiceConfiguration;
  }

  async findOneServiceConfiguration(id: string) {
    const serviceConfigurationStored = await super.findOne({
      filterOptions: { _id: id },
    });
    return serviceConfigurationStored;
  }

  async updateServiceConfiguration(
    updateServiceConfigurationDto: UpdateServiceConfigurationDto,
  ) {
    let actionSpecificationsIds: string[] = [];
    if (updateServiceConfigurationDto.servicesEntrypoints) {
      await Promise.all(
        updateServiceConfigurationDto.servicesEntrypoints.map(
          async (actionSpecification) => {
            let storedActionSpecification =
              await this.actionsSpecificationsService.findOne({
                filterOptions: {
                  action: actionSpecification.action,
                },
                triggerError: false,
              });
            if (!storedActionSpecification) {
              const newActionSpecification =
                await this.actionsSpecificationsService.createActionSpecifications(
                  [actionSpecification],
                );
              storedActionSpecification = newActionSpecification[0];
            } else {
              storedActionSpecification =
                await this.actionsSpecificationsService.update(
                  storedActionSpecification._id,
                  actionSpecification,
                );
            }
            actionSpecificationsIds.push(storedActionSpecification._id);
          },
        ),
      );
    }
    if (actionSpecificationsIds.length > 0) {
      await this.update(updateServiceConfigurationDto._id, {
        $addToSet: {
          servicesEntrypoints: actionSpecificationsIds,
        },
      });
    }

    const newServiceConfiguration = await super.update(
      updateServiceConfigurationDto._id,
      {
        ...updateServiceConfigurationDto,
      },
    );
    return newServiceConfiguration;
  }
}
