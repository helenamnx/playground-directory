import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QuestionConfigurationsService } from './question-configurations.service';
import { CreateQuestionConfigurationDto } from './dto/create-question-configuration.dto';
import { UpdateQuestionConfigurationDto } from './dto/update-question-configuration.dto';

@Controller('question-configurations')
export class QuestionConfigurationsController {
  constructor(private readonly questionConfigurationsService: QuestionConfigurationsService) { }

  @Post()
  create(@Body() createQuestionConfigurationDto: CreateQuestionConfigurationDto) {
    return this.questionConfigurationsService.create(createQuestionConfigurationDto);
  }



}
