import { Injectable } from '@nestjs/common';
import categoriesMockDev from '@/shared/database/data/seed-mocks/development-seed/categories.mock.json';
import categoryScopesMockDev from '@/shared/database/data/seed-mocks/development-seed/category-scopes.mock.json';
import examTypesMockDev from '@/shared/database/data/seed-mocks/development-seed/exam-types.mock.json';
import { AppUsersService } from '@/modules/app-users/app-users.service';
import { CategoryScopesService } from '@/modules/category-scopes/category-scopes.service';
import { CategoriesService } from '@/modules/categories/categories.service';
import { LanguagesEnum } from '@/shared/enums/languages.enum';
import { NodeEnvEnum } from '@/shared/enums/node-env.enum';
import { ExamTypesService } from '@/modules/exam-types/exam-types.service';

@Injectable()
export class CategoriesSeedService {
  private readonly categoriesMockDev =
    process.env.NODE_ENV === NodeEnvEnum.DEVELOPMENT
      ? categoriesMockDev
      : categoriesMockDev; //TODO: add seed for production

  private readonly examTypesMock =
    process.env.NODE_ENV === NodeEnvEnum.DEVELOPMENT
      ? examTypesMockDev
      : examTypesMockDev; //TODO: add seed for production

  private readonly categoryScopesMockDev =
    process.env.NODE_ENV === NodeEnvEnum.DEVELOPMENT
      ? categoryScopesMockDev
      : categoryScopesMockDev; //TODO: add seed for production

  constructor(
    private readonly categoryScopesService: CategoryScopesService,
    private readonly categoriesService: CategoriesService,
    private readonly examTypesService: ExamTypesService,
  ) {}

  async seedCategoriesAndExamTypes() {
    try {
      await this.seedCategories();
      await this.seedExamTypes();
      console.log('Categories seeded successfully.');
    } catch (error) {
      console.error('Error seeding app users:', error);
      throw error;
    }
  }

  async seedCategories() {
    //create the scopes
    await Promise.all(
      this.categoryScopesMockDev.map(async (categoryScope) => {
        const storedCategoryScope = await this.categoryScopesService.findOne({
          filterOptions: {
            alias: categoryScope.alias,
          },
          triggerError: false,
        });
        if (storedCategoryScope) return;

        await this.categoryScopesService.createCategoryScope(categoryScope);
      }),
    );

    //create the categories
    await Promise.all(
      this.categoriesMockDev.map(async (category) => {
        const storedCategory = await this.categoriesService.findOne({
          filterOptions: {
            code: category.code,
          },
          triggerError: false,
        });
        if (storedCategory) return;

        await this.categoriesService.createCategory(category, LanguagesEnum.ES);
      }),
    );
  }

  async seedExamTypes() {
    //create the examTypes
    const examTypeCount = await this.examTypesService.countDocuments();
    if (examTypeCount > 0) return;
    await Promise.all(
      this.examTypesMock.map(async (examType) => {
        const storedExamType = await this.examTypesService.findOne({
          filterOptions: {
            value: examType.value,
          },
          triggerError: false,
        });
        if (storedExamType) return;

        await this.examTypesService.createExamType(examType, LanguagesEnum.ES);
      }),
    );
  }
}
