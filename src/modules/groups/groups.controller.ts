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
import { GroupsService } from './groups.service';
import {
  CreateGroupControllerDto,
  CreateGroupDto,
} from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Roles } from '@/shared/decorators/user-scopes.decorator';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { UserTokenGuard } from '@/shared/guards/user-token.guard';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';

@Controller('groups')
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly alsService: AsyncStorageService,
  ) {}

  @Roles([RolesEnum.ADMINISTRATOR])
  // @Resource(resourcesJson.Groups)
  // @UserScope(scopesJson['groups:create'])
  @UseGuards(UserTokenGuard)
  @Post()
  create(@Body() createGroupDto: CreateGroupControllerDto) {
    const defaultLanguage = this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE);
    return this.groupsService.createGroup({
      ...createGroupDto,
      value: createGroupDto.name[defaultLanguage],
    });
  }

  // @Roles([RolesEnum.ADMINISTRATOR])
  // @Resource(resourcesJson.Groups)
  // @UserScope(scopesJson['groups:view-all'])
  // @UseGuards(UserTokenGuard)
  @Get()
  findAllGroups() {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    return this.groupsService.findAllGroups({
      filterOptions: this.alsService.get(AlsKeysEnum.FILTER_OPTIONS),
      paginationParams: this.alsService.get(AlsKeysEnum.PAGINATION_PARAMS),
      lang:
        filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    });
  }

  // @Roles([RolesEnum.ADMINISTRATOR])
  // @Resource(resourcesJson.Groups)
  // @UserScope(scopesJson['groups:view-all'])
  @UseGuards(UserTokenGuard)
  @Get(':id')
  findOneGroup(@Param('id') id: string) {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);

    return this.groupsService.findOneGroup(
      id,
      filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    );
  }

  @Roles([RolesEnum.ADMINISTRATOR])
  @UseGuards(UserTokenGuard)
  @Delete(':id')
  async deleteGroup(@Param('id') id: string) {
    await this.groupsService.deleteGroup(id);
    return { message: 'Group deleted successfully' };
  }

  @Roles([RolesEnum.ADMINISTRATOR])
  @UseGuards(UserTokenGuard)
  @Put()
  async updateGroup(@Body() updateGroupDto: UpdateGroupDto) {
    await this.groupsService.updateGroup(updateGroupDto);
    return { message: 'Group updated successfully' };
  }
}
