import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserConfigurationsService } from './user-configurations.service';
import { CreateUserConfigurationDto } from './dto/create-user-configuration.dto';
import { UpdateUserConfigurationDto } from './dto/update-user-configuration.dto';

@Controller('user-configurations')
export class UserConfigurationsController {
  constructor(
    private readonly userConfigurationsService: UserConfigurationsService,
  ) {}

  @Post()
  create(@Body() createUserConfigurationDto: CreateUserConfigurationDto) {
    return this.userConfigurationsService.create(createUserConfigurationDto);
  }

  @Get()
  findAll() {
    return this.userConfigurationsService.findAll({});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userConfigurationsService.findOne({
      filterOptions: { _id: id },
    });
  }

  @Patch()
  update(@Body() updateUserConfigurationDto: UpdateUserConfigurationDto) {
    return this.userConfigurationsService.updateConfiguration(
      updateUserConfigurationDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userConfigurationsService.remove(id);
  }
}
