import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlatformConfigurationsService } from './platform-configurations.service';
import { CreatePlatformConfigurationDto } from './dto/create-platform.dto';
import { UpdatePlatformConfigurationDto } from './dto/update-platform.dto';

@Controller('platform-configurations')
export class PlatformConfigurationsController {
  constructor(
    private readonly platformConfigurationsService: PlatformConfigurationsService,
  ) {}

  @Post()
  create(
    @Body() createPlatformConfigurationDto: CreatePlatformConfigurationDto,
  ) {
    const newPlatformConfiguration =
      this.platformConfigurationsService.createPlatformConfiguration(
        createPlatformConfigurationDto,
      );
    return newPlatformConfiguration;
  }

  // @Get()
  // findAll() {
  //   //TODO: retornar la configuración de la plataforma
  //   return this.platformConfigurationsService.findAllPlatformsConfigurations();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   //TODO: Auteticación de usuario
  //   // si autenticación falla, lanzar error
  //   // si autenticación es correcta, continuar
  //   //TODO: GET /platform-configurations
  //   //si no existe la configuración de la plataforma, lanzar error
  //   //si existe la configuración de la plataforma, continuar
  //   //TODO: retornar la configuración de la plataforma
  //   return this.platformConfigurationsService.findOnePlatformsConfiguration(
  //     +id,
  //   );
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlatformConfigurationDto: UpdatePlatformConfigurationDto,
  ) {
    //TODO: Autenticación de usuario
    // si autenticación falla, lanzar error
    // si autenticación es correcta, continuar
    //TODO: Actualizar la configuración de la plataforma a traves del CRUDService
    //si devuelve error, lanzar error
    //TODO: Crear Historial de cambios
    //si no devuelve error, continuar
    const configurationUpdated =
      this.platformConfigurationsService.updatePlatformConfiguration(
        updatePlatformConfigurationDto,
      );
    //TODO: Crear Historial de cambios
    return configurationUpdated;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.platformConfigurationsService.removePlatformConfiguration(+id);
  }
}
