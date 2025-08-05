import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ActionSpecificationsService } from './action-specifications.service';
import { CreateActionSpecificationDto } from './dto/create-action-specification.dto';
import { UpdateActionSpecificationDto } from './dto/update-action-specification.dto';

@Controller('action-specifications')
export class ActionSpecificationsController {
  constructor(
    private readonly actionSpecificationsService: ActionSpecificationsService,
  ) {}

  // @Post()
  // create(@Body() createActionSpecificationDto: CreateActionSpecificationDto) {
  //   return this.actionSpecificationsService.create(createActionSpecificationDto);
  // }

  // @Get()
  // findAll() {
  //   return this.actionSpecificationsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.actionSpecificationsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateActionSpecificationDto: UpdateActionSpecificationDto) {
  //   return this.actionSpecificationsService.update(+id, updateActionSpecificationDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.actionSpecificationsService.remove(+id);
  // }
}
