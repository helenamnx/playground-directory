import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { ServiceConfigurationsService } from '../service-configurations/service-configurations.service';
import { Service } from './schemas/service.schema';
import { Model } from 'mongoose';
import { PlatformsService } from '../platforms/platforms.service';
import { HistoryService } from '../history/history.service';

@Injectable()
export class ServicesService extends CRUDService<Service> {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<Service>,
    private readonly serviceConfigurationsService: ServiceConfigurationsService,
    private readonly historyService: HistoryService,
  ) {
    super(serviceModel);
  }

  async create(createServiceDto: CreateServiceDto) {
    try {
      // create the service configuration
      const serviceConfiguration =
        await this.serviceConfigurationsService.create(
          createServiceDto.configuration,
        );

      const newService = await super.create({
        ...createServiceDto,
        configuration: serviceConfiguration._id,
      });

      const newHistory = await this.historyService.createHistoryRecord({
        entity: newService,
        actionType: 'create',
        actionStatus: 'success',
        nextStatus: 'created',
      });
      const newServiceWithHistory = await super.update(newService._id, {
        $push: {
          history: newHistory._id,
        },
      });
      return newService;
    } catch (error) {
      console.log(error);
      const errorHistory = await this.historyService.createHistoryRecord({
        entity: null,
        actionType: 'create-service',
        actionStatus: 'error',
        nextStatus: 'error',
        errorMessage: error.message,
      });
      throw error;
    }
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    try {
      const updatedService = await super.update(id, updateServiceDto);
      const updatedHistory = await this.historyService.createHistoryRecord({
        entity: updatedService,
        actionType: 'update-service',
        actionStatus: 'success',
        nextStatus: 'updated',
      });
      const updatedServiceWithHistory = await super.update(updatedService._id, {
        $push: {
          history: updatedHistory._id,
        },
      });
      return updatedService;
    } catch (error) {
      const errorHistory = await this.historyService.createHistoryRecord({
        entity: null,
        actionType: 'update-service',
        actionStatus: 'error',
        nextStatus: 'error',
        errorMessage: error.message,
      });
    }
  }

  async upsertService(createServiceDto: CreateServiceDto) {
    const existingService = await super.findOne({
      filterOptions: {
        externalPlatformId: createServiceDto.externalPlatformId,
      },
      triggerError: false,
    });
    if (existingService) {
      const newService = await this.update(
        existingService._id,
        createServiceDto,
      );
      return existingService;
    } else {
      const newService = await this.create(createServiceDto);
      return newService;
    }
  }
}
