import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import resourcesJson from '@/shared/json/resources.json';
import scopesJson from '@/shared/json/scopes.json';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import { CreateInformationDto } from '../information/dto/create-information.dto';
import { UserTokenGuard } from '@/shared/guards/user-token.guard';
import { UpdateInformationDto } from '../information/dto/update-information.dto';
import { Resource, UserScope } from '@/shared/decorators/user-scopes.decorator';
import { SendContactEmailDto } from '../messages/dto/send-contact-email.dto';
import { EmailsService } from '../emails/emails.service';
import { MessagesService } from '../messages/messages.service';

@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly alsService: AsyncStorageService,
  ) {}

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.createClient(createClientDto);
  }

  @Get()
  findAll() {
    return this.clientsService.findAllClients();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOneClient(+id);
  }

  @Get('information')
  findClientInformation() {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    return this.clientsService.getClientInformation({
      clientId: this.alsService.get(AlsKeysEnum.CLIENT)._id,
      informationAlias: filterOptions.alias,
      lang:
        filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    });
  }

  @Get('contact-points')
  getContactPoints() {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    return this.clientsService.getClientContactPoints(
      this.alsService.get(AlsKeysEnum.CLIENT)._id,
      filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    );
  }

  @Resource(resourcesJson.Clients)
  @UserScope(scopesJson['clients:information:create'])
  @UseGuards(UserTokenGuard)
  @Post('information')
  createClientInformation(
    @Body() createClientInformationDto: CreateInformationDto,
  ) {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    const clientId = this.alsService.get(AlsKeysEnum.CLIENT)._id;
    return this.clientsService.createClientInformation(
      clientId,
      filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
      {
        ...createClientInformationDto,
        author: this.alsService.get(AlsKeysEnum.APP_USER)._id,
      },
    );
  }

  @Put('information')
  @Resource(resourcesJson.Clients)
  @UserScope(scopesJson['clients:information:update'])
  @UseGuards(UserTokenGuard)
  updateClientInformation(
    @Body() createClientInformationDto: UpdateInformationDto,
  ) {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    const clientId = this.alsService.get(AlsKeysEnum.CLIENT)._id;
    return this.clientsService.updateClientInformation(
      clientId,
      filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
      {
        ...createClientInformationDto,
        author: this.alsService.get(AlsKeysEnum.APP_USER)._id,
      },
    );
  }

  @UseGuards(UserTokenGuard)
  @Resource(resourcesJson.Clients)
  @UserScope(scopesJson['clients:update'])
  @Patch()
  update(@Body() updateClientDto: any) {
    return this.clientsService.updateClient(updateClientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.removeClient(+id);
  }
}
