import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceConfiguration } from './schemas/service-configuration.schema';
import { CRUDService } from 'src/config/database/CRUD/crud.service';
import { CreateServiceConfigurationDto } from './dto/create-service-configuration.dto';

@Injectable()
export class ServiceConfigurationsService extends CRUDService<ServiceConfiguration> {
  constructor(
    @InjectModel(ServiceConfiguration.name)
    private serviceConfigurationModel: Model<ServiceConfiguration>,
  ) {
    super(serviceConfigurationModel);
  }
  async create(createServiceConfigurationDto: CreateServiceConfigurationDto) {
    //TODO: Validation and error handling

    const newServiceConfiguration = await super.create(
      createServiceConfigurationDto,
    );
    return newServiceConfiguration;
  }

  async findOneServiceConfiguration(id: string) {
    const serviceConfigurationStored = await super.findOne({
      filterOptions: { _id: id },
    });
    return serviceConfigurationStored;
  }

  // update(
  //   id: number,
  //   updateServiceConfigurationDto: UpdateServiceConfigurationDto,
  // ) {
  //   return `This action updates a #${id} serviceConfiguration`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} serviceConfiguration`;
  // }
}
