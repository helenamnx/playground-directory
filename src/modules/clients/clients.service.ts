import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { BadRequestCustomResponse } from '@/shared/responses/error/custom-error-response';
import { InjectModel } from '@nestjs/mongoose';
import { ClientConfigurationsService } from '../client-configurations/client-configurations.service';
import { Client } from './schemas/client.schema';
import { Model } from 'mongoose';

@Injectable()
export class ClientsService extends CRUDService<Client> {
  constructor(
    @InjectModel(Client.name)
    private readonly clientModel: Model<Client>,
    private readonly clientConfigurationsService: ClientConfigurationsService,
  ) {
    super(clientModel);
  }

  async createClient(createClientDto: CreateClientDto) {
    try {
      const client = await this.findOne({
        filterOptions: {
          alias: createClientDto.alias,
        },
        triggerError: false,
      });
      if (client) {
        throw new BadRequestCustomResponse({
          title: 'The client already exists',
          detail: 'The client with the same externalId already exists',
          key: CustomErrorKeys.CLIENT_ALREADY_EXISTS,
        });
      }
      const newClientConfiguration =
        await this.clientConfigurationsService.createClientConfiguration(
          createClientDto.configuration,
        );
      const newClient = await super.create({
        ...createClientDto,
        configuration: newClientConfiguration._id,
      });
      //TODO: add history
      return newClient;
    } catch (error) {
      //TODO: add history

      throw error;
    }
  }

  findAllClients() {
    return `This action returns all clients`;
  }

  findOneClient(id: number) {
    return `This action returns a #${id} client`;
  }

  async updateClient(updateClientDto: UpdateClientDto) {
    try {
      const storedClient = await super.findOne({
        filterOptions: {
          _id: updateClientDto._id,
        },
      });

      const updatedClientConfiguration =
        await this.clientConfigurationsService.updateClientConfiguration({
          _id: storedClient.configuration.toString(),
          ...updateClientDto.configuration,
        });
      const updatedClient = await super.update(updateClientDto._id, {
        ...updateClientDto,
        configuration: updatedClientConfiguration._id,
      });

      return updatedClient;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  removeClient(id: number) {
    return `This action removes a #${id} client`;
  }
}
