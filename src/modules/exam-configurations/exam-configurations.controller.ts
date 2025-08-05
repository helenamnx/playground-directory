import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExamConfigurationsService } from './exam-configurations.service';
import { CreateExamConfigurationDto } from './dto/create-exam-configuration.dto';
import { UpdateExamConfigurationDto } from './dto/update-exam-configuration.dto';

@Controller('exam-configurations')
export class ExamConfigurationsController {
  constructor(
    private readonly examConfigurationsService: ExamConfigurationsService,
  ) {}
}
