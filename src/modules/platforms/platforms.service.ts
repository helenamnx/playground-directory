import { Injectable } from '@nestjs/common';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { AssingClientToPlatformDto } from './dto/assing-client-to-platform.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { BadRequestCustomResponse } from '@/shared/responses/error/custom-error-response';
import { InjectModel } from '@nestjs/mongoose';
import { ClientsService } from '../clients/clients.service';
import { HistoryService } from '../history/history.service';
import { Platform } from './schemas/platform.schema';
import { Model } from 'mongoose';
import { PlatformConfigurationsService } from '../platform-configurations/platform-configurations.service';
import { ServicesService } from '../services/services.service';
import { CreateServiceDto } from '../services/dto/create-service.dto';
import { ConfigService } from '@nestjs/config';
import { CreateClientDto } from '../clients/dto/create-client.dto';
import { UpdateClientDto } from '../clients/dto/update-client.dto';

@Injectable()
export class PlatformsService extends CRUDService<Platform> {
  private readonly ownPlatformAlias: string;
  constructor(
    @InjectModel(Platform.name)
    private readonly platformModel: Model<Platform>,
    private readonly platformConfigurationService: PlatformConfigurationsService,
    private readonly historyService: HistoryService,
    private readonly clientService: ClientsService,
    private readonly configService: ConfigService,
    private readonly serviceService: ServicesService,
  ) {
    super(platformModel);
    this.ownPlatformAlias = this.configService.get<string>(
      'platform.OWN_PLATFORM_ALIAS',
    );
  }

  async createPlatform(createPlatformDto: CreatePlatformDto) {
    const startTime = new Date();
    try {
      const platformExists = await super.findOne({
        filterOptions: { name: createPlatformDto.name },
        triggerError: false,
      });
      if (platformExists) {
        throw new BadRequestCustomResponse({
          title: 'Platform already exists',
          detail: `Platform with name ${createPlatformDto.name} already exists`,
          key: CustomErrorKeys.ERROR_CREATING_REGISTERS,
        });
      }
      const newConfiguration =
        await this.platformConfigurationService.createPlatformConfiguration(
          createPlatformDto.configuration,
        );
      const newPlatform = await super.create({
        ...createPlatformDto,
        configuration: (newConfiguration as any)._id,
      });
      /*
      const newHistory = await this.historyService.createHistoryRecord({
        entity: newPlatform,
        actionType: 'create',
        actionStatus: 'success',
        nextStatus: 'created',
      });
      const newPlatformWithHistory = await super.update(newPlatform._id, {
        $push: {
          history: newHistory._id,
        },
      });
      */
      return newPlatform;
    } catch (error) {
      console.log(error);
      /*
      const errorHistory = await this.historyService.createHistoryRecord({
        entity: null,
        actionType: 'create-platform',
        actionStatus: 'error',
        nextStatus: 'error',
        errorMessage: error.message,
      });
      */
      throw error;
    }
  }

  async findAllPlatforms() {
    //TODO: Auteticación de usuario
    // si autenticación falla, lanzar error
    // si autenticación es correcta, continuar
    //TODO: GET /platform
    //si no existe la configuración de la plataforma, lanzar error
    //si existe  la plataforma, continuar
    return await super.findAll({});
  }

  async updatePlatform(updatePlatformDto: UpdatePlatformDto) {
    const startTime = new Date();
    try {
      const storedPlatform = await super.findOne({
        filterOptions: {
          _id: updatePlatformDto._id,
        },
      });
      if (!storedPlatform) {
        throw new BadRequestCustomResponse({
          title: 'Platform not found',
          detail: `Platform with id ${updatePlatformDto._id} not found`,
          key: CustomErrorKeys.ERROR_UPDATING_REGISTERS,
        });
      }

      if (updatePlatformDto.configuration) {
        await this.platformConfigurationService.updatePlatformConfiguration({
          ...updatePlatformDto.configuration,
          _id: storedPlatform.configuration.toString(),
        });
      }

      const updatedPlatform = await super.update(updatePlatformDto._id, {
        updatePlatformDto,
      });
      /*
      const updatedHistory = await this.historyService.createHistoryRecord({
        entity: updatedPlatform,
        actionType: 'update',
        actionStatus: 'success',
        nextStatus: 'updated',
      });
      await super.update(updatedPlatform._id, {
        $push: {
          history: updatedHistory._id,
        },
      });
      */
      return updatedPlatform;
    } catch (error) {
      console.log(error);
      /*
      const errorHistory = await this.historyService.createHistoryRecord({
        entity: null,
        actionType: 'update-platform',
        actionStatus: 'error',
        nextStatus: 'error',
        errorMessage: error.message,
      });
      */
      throw error;
    }
  }

  removePlatform(id: number) {
    return `This action removes a #${id} platform`;
  }

  /**
   * @author: Helena Rodríguez
   * @description: Get platform by query
   * @param query
   * @returns
   */
  async getPlatform(id: string, option: string) {
    const platform = await this.findOne({ filterOptions: { _id: id } });
    if (!platform) {
      throw new BadRequestCustomResponse({
        title: 'Error getting platform',
        detail: 'Platform not found',
        key: CustomErrorKeys.REGISTER_NOT_FOUND,
      });
    }
    switch (option) {
      case 'menu':
        return this.findOne({
          filterOptions: { _id: id },
          selectOptions: ['_id'],
          populateOptions: [{ path: 'configuration', select: ['menuOptions'] }],
        });
      case 'all':
        return this.findOne({
          filterOptions: { _id: id },
          populateOptions: ['configuration'],
        });
      case 'configuration':
        return this.findOne({
          filterOptions: { _id: id },
          selectOptions: ['_id'],
          populateOptions: ['configuration'],
        });
      case 'name':
      default:
        return this.findOne({
          filterOptions: { _id: id },
          selectOptions: ['_id', 'name'],
        });
    }
  }

  async assignClientToPlatform(createClientDto: CreateClientDto) {
    try {
      const storedClient = await this.clientService.findOne({
        triggerError: false,
        filterOptions: {
          alias: createClientDto.alias,
        },
      });
      if (storedClient) {
        const updatedClient = await this.clientService.updateClient(
          createClientDto as UpdateClientDto,
        );
        //TODO: add history
        return {
          externalClientId: updatedClient._id,
        };
      }

      //create a new client
      const newClient = await this.clientService.createClient(createClientDto);
      const ownPlatform = await this.getOwnPlatform();
      await super.update(ownPlatform._id, {
        $push: {
          clients: newClient._id,
        },
      });
      //TODO: add history
      return {
        externalClientId: newClient._id,
      };
    } catch (e) {
      //TODO: add history
      console.log(e);
      throw e;
    }
  }

  async upsertService(createServiceDto: CreateServiceDto) {
    const myPlatform = await this.getOwnPlatform();
    const service = await this.serviceService.upsertService(createServiceDto);
    const updatedPlatform = await super.update(myPlatform._id, {
      $push: {
        services: service._id,
      },
    });
    return {
      externalServiceId: service._id,
    };
  }

  async getOwnPlatform() {
    const storedPlatform = await super.findOne({
      filterOptions: {
        alias: this.ownPlatformAlias,
      },
      populateOptions: ['services', 'configuration'],
    });
    return storedPlatform;
  }
}
