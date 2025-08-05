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
import resourcesJson from '@/shared/json/resources.json';
import scopesJson from '@/shared/json/scopes.json';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import {
  Resource,
  Roles,
  UserScope,
} from '@/shared/decorators/user-scopes.decorator';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { UserTokenGuard } from '@/shared/guards/user-token.guard';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly alsService: AsyncStorageService,
  ) {}

  @Roles([RolesEnum.ADMINISTRATOR])
  @UseGuards(UserTokenGuard)
  @Resource(resourcesJson.Topics)
  @UserScope(scopesJson['topics:create'])
  @UseGuards(UserTokenGuard)
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(
      createCategoryDto,
      this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    );
  }

  @Get()
  findAllCategories() {
    return this.categoriesService.findAllCategories({
      filterOptions: this.alsService.get(AlsKeysEnum.FILTER_OPTIONS),
      paginationParams: this.alsService.get(AlsKeysEnum.PAGINATION_PARAMS),
      lang: this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    });
  }

  @Get('/tree')
  findCategoriesTree() {
    return this.categoriesService.findCategoriesTree({
      filterOptions: this.alsService.get(AlsKeysEnum.FILTER_OPTIONS),
      paginationParams: this.alsService.get(AlsKeysEnum.PAGINATION_PARAMS),
      lang: this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    });
  }

  @Get(':id')
  findOneCategory(@Param('id') id: string) {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    return this.categoriesService.findOneByID(
      id,
      filterOptions.lang
        ? filterOptions.lang
        : this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    );
  }
}
