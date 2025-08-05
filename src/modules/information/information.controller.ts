import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CreateInformationDto } from './dto/create-information.dto';
import { UpdateInformationDto } from './dto/update-information.dto';
import { InformationService } from './information.service';

@Controller('information')
export class InformationController {
  constructor(private readonly informationService: InformationService) {}

  @Post()
  create(@Body() createInformationDto: CreateInformationDto) {
    return this.informationService.create(createInformationDto);
  }

  @Get()
  findAll() {
    return this.informationService.findAll({});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.informationService.findOneInformation(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateInformationDto: UpdateInformationDto,
  // ) {
  //   return this.informationService.updateInformation(updateInformationDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informationService.remove(id);
  }
}
