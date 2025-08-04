import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ServiceConfigurationsService } from './service-configurations.service';
import { CreateServiceConfigurationDto } from './dto/create-service-configuration.dto';
import { UpdateServiceConfigurationDto } from './dto/update-service-configuration.dto';

@Controller('service-configurations')
export class ServiceConfigurationsController {
  constructor(
    private readonly serviceConfigurationsService: ServiceConfigurationsService,
  ) {}

  @Post()
  create(@Body() createServiceConfigurationDto: CreateServiceConfigurationDto) {
    return this.serviceConfigurationsService.create(
      createServiceConfigurationDto,
    );
  }

  @Get()
  findAll() {
    //TODO: Check if the client can access to this endpoint
    //TODO: Check if the client has the right to access to this endpoint
    //TODO: Get the pagination and filter params
    //TODO: Add the sort params
    //TODO: Call the service to find all the service configurations by the params
    //TODO: Return the service configurations
    // return this.serviceConfigurationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    //TODO: Check if the client can access to this endpoint
    //TODO: Check if the client has the right to access to this endpoint
    //TODO: Call the service to find a service configuration by id or other param
    //TODO: Return the service configuration
    return this.serviceConfigurationsService.findOneServiceConfiguration(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceConfigurationDto: UpdateServiceConfigurationDto,
  ) {
    return this.serviceConfigurationsService.update(
      id,
      updateServiceConfigurationDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceConfigurationsService.remove(id);
  }
}
