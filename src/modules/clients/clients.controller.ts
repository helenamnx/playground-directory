import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

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

  @Patch()
  update(@Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.updateClient(updateClientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.removeClient(+id);
  }
}
