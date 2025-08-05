import { Controller, Get, Req } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';

@Controller('user-roles')
export class UserRolesController {
  constructor(
    private readonly userRolesService: UserRolesService,
    private readonly alsService: AsyncStorageService,
  ) {}

  @Get()
  findAll() {
    const paginationParams = this.alsService.get(AlsKeysEnum.PAGINATION_PARAMS);
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    return this.userRolesService.findAllRoles({
      filterOptions,
      paginationParams,
      lang:
        filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    });
  }
}
