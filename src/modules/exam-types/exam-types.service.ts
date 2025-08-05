import { Injectable } from '@nestjs/common';
import { CreateExamTypeDto } from './dto/create-exam-type.dto';
import { UpdateExamTypeDto } from './dto/update-exam-type.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { ExamType } from './schemas/exam-type.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExamConfigurationsService } from '../exam-configurations/exam-configurations.service';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { LanguagesEnum } from '@/shared/enums/languages.enum';
import { PropertiesEnum } from '@/shared/enums/properties.enum';
import {
  ConflictCustomResponse,
  NotFoundCustomResponse,
} from '@/shared/responses/error/custom-error-response';
import { generateSlug } from '@/shared/utils/generate-slug.utils';
import {
  getLanguageMapValue,
  generateRandomNumber,
  transformToLanguageMapType,
  hasUserSomeRoles,
} from '@/shared/utils/utils';
import { CategoryScopesService } from '../category-scopes/category-scopes.service';
import { filterLanguageMap } from '@/shared/utils/filter-language-map.utils';
import { AppUser } from '../app-users/schemas/app-user.schema';
import { RolesEnum } from '@/shared/enums/roles.enum';
@Injectable()
export class ExamTypesService extends CRUDService<ExamType> {
  constructor(
    @InjectModel(ExamType.name) private examTypeModel: Model<ExamType>,
    private readonly examConfigurationsService: ExamConfigurationsService,
    private readonly categoryScopesService: CategoryScopesService,
  ) {
    super(examTypeModel);
  }

  async createExamType(createExamTypeDto: CreateExamTypeDto, language: string) {
    const startTime = new Date();
    try {
      const {
        parentCategories,
        scope,
        isActive,
        title,
        configuration,
        description,
        code,
        highlighted,
        value,
      } = createExamTypeDto;

      //check if scopes exists

      await this.categoryScopesService.findOneCategoryScope(scope);

      //Check if the category already exists
      const existingCategory = await super.findOne({
        filterOptions: {
          'title.languageMap.es': getLanguageMapValue(title, language), //TODO: cambiar string a pelo
          value: createExamTypeDto.value,
        },
        triggerError: false,
      });

      if (existingCategory) {
        throw new ConflictCustomResponse({
          title: 'Category already exists',
          key: CustomErrorKeys.CATEGORY_ALREADY_EXISTS,
          detail: 'Category already exists',
        });
      }

      // Generate slug for the information
      const slug = generateSlug(getLanguageMapValue(title, language));

      // Check if parent categories exist
      const parentCategoryIds = [];
      if (parentCategories && parentCategories.length > 0) {
        for (const parentId of parentCategories) {
          const parentCategory = await super.findOne({
            filterOptions: { _id: parentId },
          });
          if (!parentCategory) {
            throw new NotFoundCustomResponse({
              title: 'Category not found',
              key: CustomErrorKeys.CATEGORY_NOT_FOUND,
              detail: `Category with ID "${parentId}" does not exist.`,
            });
          }
          parentCategoryIds.push(parentCategory._id);
        }
      }

      const newExamConfiguration =
        await this.examConfigurationsService.createExamConfiguration(
          configuration,
        );

      //Create the new category
      const newExamType = await super.create({
        highlighted,
        configuration: newExamConfiguration._id,
        code: code
          ? code
          : generateSlug(title[LanguagesEnum.ES]) + generateRandomNumber(4), //TODO: recoger default language
        parentCategories: parentCategoryIds,
        value: value ? value : title[LanguagesEnum.ES],
        scope: scope,
        isActive,
        description: description
          ? transformToLanguageMapType(description)
          : null,
        title: transformToLanguageMapType(title),
        slug: {
          type: PropertiesEnum.LANGUAGE_MAP_PROPERTY,
          languageMap: {
            [language]: slug,
          },
        },
      });

      return newExamType;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async findAllExamTypes(params: {
    filterOptions?: any;
    paginationParams?: any;
    lang?: string;
    appUser: AppUser;
  }) {
    //TODO: refactor
    let { filterOptions, paginationParams, lang, appUser } = params || {};
    let canAutogenerate = filterOptions?.canAutogenerate;
    //if alias are provided from query params, make the filter options
    if (filterOptions?.alias) {
      const storedScope = await this.categoryScopesService.findOne({
        filterOptions: {
          alias: filterOptions?.alias,
        },
      });

      filterOptions = {
        ...filterOptions,
        scope: storedScope._id,
      };
      //eliminate the alias from the filter options
      delete filterOptions.alias;
    }
    delete filterOptions.canAutogenerate;
    let storedExamTypes = await super.findAll(
      {
        filterOptions,
        populateOptions: ['scope', 'configuration'],
      },
      paginationParams,
    );
    //else, return only the types where can be autogenerated
    if (canAutogenerate === 'true' || canAutogenerate === 'false') {
      const parsedCanAutogenerate = canAutogenerate === 'true'; // convierte a boolean

      storedExamTypes = storedExamTypes.filter((category) => {
        return category.configuration.canAutogenerate === parsedCanAutogenerate;
      });
    }
    //now, order the exam types by the highlighted attribute
    storedExamTypes = storedExamTypes.sort((a, b) => {
      if (a.configuration.highlighted && !b.configuration.highlighted)
        return -1;
      if (!a.configuration.highlighted && b.configuration.highlighted) return 1;
      return 0;
    });

    // If a language is provided, filter the categories
    if (lang) {
      return storedExamTypes.map((item) =>
        filterLanguageMap(item.toJSON(), lang),
      );
    }
    return storedExamTypes;
  }

  async findOneByID(id: string, lang?: string): Promise<ExamType> {
    const storedCategory = await super.findOne({
      filterOptions: {
        _id: id,
      },
      populateOptions: ['scope', 'configuration'],
    });
    if (lang) {
      return filterLanguageMap(storedCategory.toJSON(), lang);
    }
    return storedCategory;
  }

  async countDocuments() {
    return this.examTypeModel.countDocuments();
  }
}
