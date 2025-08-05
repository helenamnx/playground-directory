import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GroupConfigurationsService } from './group-configurations.service';
import { CreateGroupConfigurationDto } from './dto/create-group-configuration.dto';
import { UpdateGroupConfigurationDto } from './dto/update-group-configuration.dto';

@Controller('group-configurations')
export class GroupConfigurationsController {
  constructor(
    private readonly groupConfigurationsService: GroupConfigurationsService,
  ) {}
}
