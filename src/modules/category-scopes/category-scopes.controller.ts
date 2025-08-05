import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoryScopesService } from './category-scopes.service';
import { CreateCategoryScopeDto } from './dto/create-category-scope.dto';
import { UpdateCategoryScopeDto } from './dto/update-category-scope.dto';
import { Roles } from '@/shared/decorators/user-scopes.decorator';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { UserTokenGuard } from '@/shared/guards/user-token.guard';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import resourcesJson from '@/shared/json/resources.json';
import scopesJson from '@/shared/json/scopes.json';
import { Resource, UserScope } from '@/shared/decorators/user-scopes.decorator';

@Controller('category-scopes')
export class CategoryScopesController {
  constructor(
    private readonly categoryScopesService: CategoryScopesService,
    private readonly alsService: AsyncStorageService,
  ) {}

  @Roles([RolesEnum.ADMINISTRATOR])
  @Resource(resourcesJson.Topics)
  @UserScope(scopesJson['topics:create'])
  @UseGuards(UserTokenGuard)
  @Post()
  create(@Body() createCategoryScopeDto: CreateCategoryScopeDto) {
    return this.categoryScopesService.createCategoryScope(
      createCategoryScopeDto,
    );
  }

  @Roles([RolesEnum.ADMINISTRATOR, RolesEnum.SOCIO, RolesEnum.EXAMENES])
  @Resource(resourcesJson.Topics)
  @UserScope(scopesJson['topics:view-all'])
  @UseGuards(UserTokenGuard)
  @Get()
  findAll() {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    const paginationParams = this.alsService.get(AlsKeysEnum.PAGINATION_PARAMS);

    return this.categoryScopesService.findAllCategoryScopes({
      filterOptions: filterOptions,
      paginationParams: paginationParams,
      lang: filterOptions.lang
        ? filterOptions.lang
        : this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    });
  }

  @Roles([RolesEnum.ADMINISTRATOR, RolesEnum.SOCIO, RolesEnum.EXAMENES])
  @Resource(resourcesJson.Topics)
  @UserScope(scopesJson['topics:view-all'])
  @UseGuards(UserTokenGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryScopesService.findOneCategoryScope(
      id,
      this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    );
  }
}
