import { Injectable } from '@nestjs/common';
import { CreateClientConfigurationDto } from './dto/create-client-configuration.dto';
import { UpdateClientConfigurationDto } from './dto/update-client-configuration.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ClientConfiguration } from './schemas/client-configuration.schema';
import { Model } from 'mongoose';
import { CRUDService } from 'src/config/database/CRUD/crud.service';
import { ActionSpecificationsService } from '../action-specifications/action-specifications.service';
import { UpdateActionSpecificationDto } from '../action-specifications/dto/update-action-specification.dto';

@Injectable()
export class ClientConfigurationsService extends CRUDService<ClientConfiguration> {
  constructor(
    @InjectModel(ClientConfiguration.name)
    private readonly clientConfigurationModel: Model<ClientConfiguration>,
    private readonly actionsSpecificationsService: ActionSpecificationsService,
  ) {
    super(clientConfigurationModel);
  }
  async createClientConfiguration(
    createClientConfigurationDto: CreateClientConfigurationDto,
  ) {
    try {
      let actionSpecificationsIds: string[] = [];
      if (createClientConfigurationDto.servicesEntrypoints) {
        const actionSpecifications =
          await this.actionsSpecificationsService.createActionSpecifications(
            createClientConfigurationDto.servicesEntrypoints,
          );
        actionSpecificationsIds = actionSpecifications.map(
          (actionSpecification) => actionSpecification._id,
        );
      }
      const newClientConfiguration = await super.create({
        ...createClientConfigurationDto,
        servicesEntrypoints: actionSpecificationsIds,
      });
      return newClientConfiguration;
    } catch (error) {
      throw error;
    }
  }

  findAllClientConfigurations() {
    return `This action returns all clientConfigurations`;
  }

  findOneClientConfiguration(id: number) {
    return `This action returns a #${id} clientConfiguration`;
  }

  removeClientConfiguration(id: number) {
    return `This action removes a #${id} clientConfiguration`;
  }

  async updateClientConfiguration(
    updateClientConfigurationDto: UpdateClientConfigurationDto,
  ) {
    try {
      const { _id, servicesEntrypoints } = updateClientConfigurationDto;
      const storedClientConfiguration = await super.findOne({
        filterOptions: { _id: _id },
        populateOptions: ['servicesEntrypoints'],
      });

      if (servicesEntrypoints) {
        await this.upsertServicesEntrypoints(
          servicesEntrypoints,
          storedClientConfiguration._id,
        );
      }

      delete updateClientConfigurationDto.servicesEntrypoints;
      const updatedClientConfiguration = await super.update(
        _id,
        updateClientConfigurationDto,
      );
      return updatedClientConfiguration;
    } catch (e) {
      //TODO: add history
      throw e;
    }
  }

  private async upsertServicesEntrypoints(
    servicesEntrypoints: UpdateActionSpecificationDto[],
    clientConfigurationId: ClientConfiguration['_id'],
  ): Promise<void> {
    try {
      //for each service entrypoint, check if it exists, if not, create it
      const newServiceEntrypointIds = await Promise.all(
        servicesEntrypoints.map(async (serviceEntrypoint) => {
          const storedServiceEntrypoint = await this.findOne({
            filterOptions: {
              action: serviceEntrypoint.action,
            },
            triggerError: false,
          });
          //if the service entrypoint exists, update it
          if (storedServiceEntrypoint) {
            await this.actionsSpecificationsService.update(
              storedServiceEntrypoint._id,
              serviceEntrypoint,
            );
            return;
          }
          //else create the service entrypoint
          const newServiceEntrypoint =
            await this.actionsSpecificationsService.create(serviceEntrypoint);
          return newServiceEntrypoint._id;
        }),
      );
      //push the new ids to the clientConfiguration
      await super.update(clientConfigurationId, {
        $push: {
          servicesEntrypoints: newServiceEntrypointIds,
        },
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
