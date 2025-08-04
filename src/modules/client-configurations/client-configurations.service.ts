import { Injectable } from '@nestjs/common';
import { CreateClientConfigurationDto } from './dto/create-client-configuration.dto';
import { UpdateClientConfigurationDto } from './dto/update-client-configuration.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ClientConfiguration } from './schemas/client-configuration.schema';
import { Model } from 'mongoose';
import { CRUDService } from 'src/config/database/CRUD/crud.service';

@Injectable()
export class ClientConfigurationsService extends CRUDService<ClientConfiguration> {
  constructor(
    @InjectModel(ClientConfiguration.name)
    private readonly clientConfigurationModel: Model<ClientConfiguration>,
  ) {
    super(clientConfigurationModel);
  }
  async createClientConfiguration(
    createClientConfigurationDto: CreateClientConfigurationDto,
  ) {
    try {
      const newClientConfiguration = await super.create(
        createClientConfigurationDto,
      );
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
      const storedClientConfiguration = await super.findOne({
        filterOptions: { _id: updateClientConfigurationDto._id },
      });

      const updatedClientConfiguration = await super.update(
        storedClientConfiguration.id,
        updateClientConfigurationDto,
      );
      return updatedClientConfiguration;
    } catch (e) {
      //TODO: add history
      throw e;
    }
  }
}
