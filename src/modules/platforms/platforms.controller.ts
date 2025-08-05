import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlatformsService } from './platforms.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { CreateServiceDto } from '../services/dto/create-service.dto';
import { ServicesService } from '../services/services.service';
import { AssingClientToPlatformDto } from './dto/assing-client-to-platform.dto';
import { CreateClientDto } from '../clients/dto/create-client.dto';
import { UserTokenGuard } from '@/shared/guards/user-token.guard';
//import { Roles } from '@/shared/decorators/user-scopes.decorator';
//import { UserTokenGuard } from '@/shared/guards/user-token.guard';

export type PlatformOption = 'name' | 'menu' | 'configuration' | 'all';

@Controller('platforms')
export class PlatformsController {
  constructor(
    private readonly platformsService: PlatformsService,
    private readonly servicesService: ServicesService,
  ) {}

  @Put('/services')
  //@Roles(['administrator'])
  //@UseGuards(UserTokenGuard)
  async upsertService(@Body() createServiceDto: CreateServiceDto) {
    console.log(createServiceDto);
    return this.platformsService.upsertService(createServiceDto);
  }

  // @Post('clients')
  // async assingClientToPlatform(
  //   @Body() clientToassign: AssingClientToPlatformDto,
  // ) {
  //   return this.platformsService.assingClientToPlatform(clientToassign);
  // }

  @Post()
  //@Roles(['administrator'])
  //@UseGuards(UserTokenGuard)
  create(@Body() createPlatformDto: CreatePlatformDto) {
    return this.platformsService.createPlatform(createPlatformDto);
  }

  @Get()
  //@Roles(['administrator'])
  //@UseGuards(UserTokenGuard)
  async findAll() {
    //TODO: Auteticación de usuario
    // si autenticación falla, lanzar error
    // si autenticación es correcta, continuar
    //TODO: GET /platforms
    //TODO: retornar la plataforma
    return await this.platformsService.findAllPlatforms();
  }

  @Put('clients')
  //@Roles(['administrator'])
  //@UseGuards(UserTokenGuard)
  async assignClientToPlatform(@Body() clientToAssign: CreateClientDto) {
    return this.platformsService.assignClientToPlatform(clientToAssign);
  }

  @Get(':id')
  //@Roles(['administrator'])
  //@UseGuards(UserTokenGuard)
  findOne(@Param('id') id: string, @Query('option') option: string) {
    console.log('option', option);

    const platformData = this.platformsService.getPlatform(id, option);
    return platformData;

    //TODO: Auteticación de usuario
    // si autenticación falla, lanzar error
    // si autenticación es correcta, continuar
    //TODO: GET /platforms
    //si no existe la plataforma, lanzar error
    //si existe la plataforma, continuar
    //TODO: retornar la plataforma
    // return this.platformsService.findOne(+id);
  }

  @Patch(':id')
  //@Roles(['administrator'])
  //@UseGuards(UserTokenGuard)
  update(
    @Param('id') id: string,
    @Body() updatePlatformDto: UpdatePlatformDto,
  ) {
    //TODO: Autenticación de usuario
    // si autenticación falla, lanzar error
    // si autenticación es correcta, continuar
    //TODO: Actualizar la configuración de la plataforma a traves del CRUDService
    //si devuelve error, lanzar error
    //TODO: Crear Historial de cambios
    //si no devuelve error, continuar
    const platformUpdated =
      this.platformsService.updatePlatform(updatePlatformDto);
    //TODO: Crear Historial de cambios
    return platformUpdated;
  }

  @Delete(':id')
  //@Roles(['administrator'])
  //@UseGuards(UserTokenGuard)
  remove(@Param('id') id: string) {
    return this.platformsService.removePlatform(+id);
  }
}
