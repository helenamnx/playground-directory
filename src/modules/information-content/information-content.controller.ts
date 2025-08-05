import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InformationContentService } from './information-content.service';
import { CreateInformationContentDto } from './dto/create-information-content.dto';
import { UpdateInformationContentDto } from './dto/update-information-content.dto';

@Controller('information-content')
export class InformationContentController {
  constructor(
    private readonly informationContentService: InformationContentService,
  ) {}

  @Post()
  create(@Body() createInformationContentDto: CreateInformationContentDto) {
    return this.informationContentService.create(createInformationContentDto);
  }

  @Get()
  findAll() {
    return this.informationContentService.findAllInformationContent();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.informationContentService.findOneInformationContent(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInformationContentDto: UpdateInformationContentDto,
  ) {
    return this.informationContentService.update(
      id,
      updateInformationContentDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informationContentService.remove(id);
  }
}
