import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserGroupsService } from './user-groups.service';
import { UpdateUsersGroupDto } from './dto/update-user-group.dto';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import { UserTokenGuard } from '@/shared/guards/user-token.guard';
import { Roles } from '@/shared/decorators/user-scopes.decorator';
import { RolesEnum } from '@/shared/enums/roles.enum';

@Controller('user-groups')
export class UserGroupsController {
  constructor(
    private readonly userGroupsService: UserGroupsService,
    private readonly alsService: AsyncStorageService,
  ) {}

  @Get('groups')
  async findAllGroupsWithAppUsers() {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    const paginationParams = this.alsService.get(AlsKeysEnum.PAGINATION_PARAMS);
    const language = this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE);
    return this.userGroupsService.findAllGroupsWithAppUsers({
      language: filterOptions.language || language,
      paginationParams: paginationParams,
    });
  }

  @Get('app-users')
  async findAllUserGroups() {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    const paginationParams = this.alsService.get(AlsKeysEnum.PAGINATION_PARAMS);
    const language = this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE);
    return this.userGroupsService.findAppUsersByGroup({
      language: filterOptions.language || language,
      paginationParams: paginationParams,
      filterOptions: filterOptions,
    });
  }

  @Roles([RolesEnum.ADMINISTRATOR])
  @UseGuards(UserTokenGuard)
  @Patch()
  async updateUserGroups(@Body() updateUserGroupsDto: UpdateUsersGroupDto[]) {
    return this.userGroupsService.updateUsersGroups(updateUserGroupsDto);
  }
}
