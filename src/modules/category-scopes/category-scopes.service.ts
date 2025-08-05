import { Injectable } from '@nestjs/common';
import { CreateCategoryScopeDto } from './dto/create-category-scope.dto';
import { UpdateCategoryScopeDto } from './dto/update-category-scope.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { CategoryScope } from './schemas/category-scope.schema';
import { Model } from 'mongoose';
import { filterLanguageMap } from '@/shared/utils/filter-language-map.utils';
import { transformToLanguageMapType } from '@/shared/utils/utils';

@Injectable()
export class CategoryScopesService extends CRUDService<CategoryScope> {
  constructor(
    @InjectModel(CategoryScope.name)
    private readonly categoryScopeModel: Model<CategoryScope>,
  ) {
    super(categoryScopeModel);
  }

  async createCategoryScope(createCategoryScopeDto: CreateCategoryScopeDto) {
    const newCategoryScope = await super.create({
      ...createCategoryScopeDto,
      alias: createCategoryScopeDto.alias,
      languageMap: transformToLanguageMapType(
        createCategoryScopeDto.languageMap,
      ),
    });
    return newCategoryScope;
  }

  async findAllCategoryScopes(params: {
    filterOptions?: any;
    paginationParams?: any;
    lang?: string;
  }) {
    const { filterOptions, paginationParams, lang } = params || {};
    const allCategoryScopes = await super.findAll({}, paginationParams);

    if (lang) {
      return allCategoryScopes.map((item) =>
        filterLanguageMap(item.toJSON(), lang),
      );
    }
    return allCategoryScopes;
  }

  async findOneCategoryScope(id: string, lang?: string) {
    const storedCategoryScope = await super.findOne({
      filterOptions: {
        _id: id,
      },
    });
    if (lang) {
      return filterLanguageMap(storedCategoryScope.toJSON(), lang);
    }
    return storedCategoryScope;
  }
}
