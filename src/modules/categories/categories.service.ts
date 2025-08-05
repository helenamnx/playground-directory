import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { generateSlug } from '@/shared/utils/generate-slug.utils';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schemas/category.schema';
import { filterLanguageMap } from '@/shared/utils/filter-language-map.utils';
import { Model } from 'mongoose';
import {
  ConflictCustomResponse,
  NotFoundCustomResponse,
} from '@/shared/responses/error/custom-error-response';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import { get } from 'http';
import {
  generateRandomNumber,
  getLanguageMapValue,
  transformToLanguageMapType,
} from '@/shared/utils/utils';
import { CategoryScopesService } from '../category-scopes/category-scopes.service';
import { PropertiesEnum } from '@/shared/enums/properties.enum';
import { LanguagesEnum } from '@/shared/enums/languages.enum';

@Injectable()
export class CategoriesService extends CRUDService<Category> {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    private readonly categoryScopesService: CategoryScopesService,
  ) {
    super(categoryModel);
  }

  /**
   * @description This function creates a new category in the database.
   * The language attribute is used to determine the main language of the category.
   * @author Damian
   * @date 17/06/2025
   * @param {CreateCategoryDto} createCategoryDto
   * @param {string} [language]
   * @returns {*}  {Promise<Category>}
   * @memberof CategoriesService
   */
  async createCategory(
    createCategoryDto: CreateCategoryDto,
    language: string,
  ): Promise<Category> {
    const { parentCategories, scope, isActive, title, value } =
      createCategoryDto;

    //check if scopes exists

    await this.categoryScopesService.findOneCategoryScope(scope);

    //Check if the category already exists
    const existingCategory = await super.findOne({
      filterOptions: {
        'title.languageMap.es': getLanguageMapValue(title, language),
        code: createCategoryDto.code,
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

    //Create the new category
    const newCategory = await super.create({
      code: createCategoryDto.code
        ? createCategoryDto.code
        : generateSlug(title[LanguagesEnum.ES]) + generateRandomNumber(4), //TODO: recoger default language
      parentCategories: parentCategoryIds,
      scope: scope,
      value: value ? value : title[LanguagesEnum.ES],

      isActive,
      title: transformToLanguageMapType(title),
      slug: {
        type: PropertiesEnum.LANGUAGE_MAP_PROPERTY,
        languageMap: {
          [language]: slug,
        },
      },
    });

    return newCategory;
  }

  async updateCategory(updateCategoryDto: UpdateCategoryDto) {
    const storedCategory = super.findOne({
      filterOptions: { _id: updateCategoryDto._id },
    });
    if (!storedCategory) {
      throw new NotFoundCustomResponse({
        title: 'Category not found',
        key: CustomErrorKeys.CATEGORY_NOT_FOUND,
        detail: `Category with ID "${updateCategoryDto._id}" does not exist.`,
      });
    }

    //if the category exists, update it
    const updatedCategory = super.update(updateCategoryDto._id, {
      ...updateCategoryDto,
    });
    // Check if the parent categories exist
    // Check if parent categories exist
    const parentCategoryIds = [];
    if (
      updateCategoryDto.parentCategories &&
      updateCategoryDto.parentCategories.length > 0
    ) {
      for (const parentId of updateCategoryDto.parentCategories) {
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
    // Update the category
    await super.update(updateCategoryDto._id, {
      ...updateCategoryDto,
      parentCategories: parentCategoryIds,
    });
    return updatedCategory;
  }

  async findAllCategories(params: {
    filterOptions?: any;
    paginationParams?: any;
    lang?: string;
  }) {
    let { filterOptions, paginationParams, lang } = params || {};

    //if alias are provided from query params, make the filter options
    if (filterOptions?.alias) {
      const scopeId = await this.categoryScopesService.findOne({
        filterOptions: {
          alias: filterOptions?.alias,
        },
      });

      filterOptions = {
        scope: scopeId,
      };
    }
    const categories = await super.findAll(
      {
        filterOptions,
        populateOptions: ['scope'],
      },
      paginationParams,
    );
    // If a language is provided, filter the categories
    // Define los campos que son LanguageMap

    if (lang) {
      return categories.map((item) => filterLanguageMap(item.toJSON(), lang));
    }
    return categories;
  }

  async findOneByID(id: string, lang?: string): Promise<Category> {
    const storedCategory = await super.findOne({
      filterOptions: {
        _id: id,
      },
      populateOptions: ['scope'],
    });
    if (lang) {
      return filterLanguageMap(storedCategory.toJSON(), lang);
    }
    return storedCategory;
  }

  async findOneByCode(code: string, lang?: string): Promise<Category> {
    const storedCategory = await super.findOne({
      filterOptions: {
        code,
      },
      triggerError: false,
    });
    return storedCategory;
  }

  /**
   * @description This function finds a single category by its name.
   * @author Damian
   * @date 07/07/2025
   * @param {string} name
   * @param {string} lang
   * @returns {*}  {Promise<Category>}
   * @memberof CategoriesService
   */
  async findOneByName(name: string, lang: string): Promise<Category> {
    const titleQuery = `title.languageMap.${lang}`;
    const storedCategory = await super.findOne({
      filterOptions: {
        [titleQuery]: name,
      },
      triggerError: false,
    });
    return storedCategory;
  }

  async findOneByValue(value: string): Promise<Category> {
    const storedCategory = await super.findOne({
      filterOptions: {
        value: value,
      },
      triggerError: false,
    });
    return storedCategory;
  }

  async findCategoriesTree(params: {
    filterOptions?: any;
    paginationParams?: any;
    lang?: string;
  }) {
    try {
      const { filterOptions, paginationParams, lang } = params || {};
      // Paso 1: Obtener categorías base (las que coinciden con el filtro)
      // Paso 1: Obtener las categorías iniciales desde tu lógica existente
      const storedCategories = await super.findAll(
        {
          populateOptions: [
            {
              path: 'scope',
              select: ['-history', '-serviceId', '-externalId'],
            },
            {
              path: 'parentCategories',
              select: ['-history', '-scope'],
            },
          ],
          selectOptions: ['-history', '-scope'],
        },
        paginationParams,
      );
      console.log(storedCategories);

      // Creamos un mapa para acceso rápido por ID
      const categoryMap = new Map<string, any>();

      storedCategories.forEach((category) => {
        (category as any).childCategories = []; // <-- así lo "inyectamos"
        categoryMap.set(category._id.toString(), category);
      });

      // Construimos el árbol
      const rootCategories = [];

      for (const category of storedCategories) {
        if (category.parentCategories && category.parentCategories.length > 0) {
          for (const parent of category.parentCategories) {
            const parentInMap = categoryMap.get(parent._id.toString());
            if (parentInMap) {
              parentInMap.childCategories.push(category);
            }
          }
        } else {
          // Sin padres → es raíz del árbol
          rootCategories.push(category);
        }
      }

      return rootCategories;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async findCategoryWithParents(categoryId: string) {
    const storedCategory = await super.findOne({
      filterOptions: {
        _id: categoryId,
      },
      populateOptions: ['parentCategories'],
    });
    return storedCategory;
  }

  async countDocuments() {
    return this.categoryModel.countDocuments();
  }
}
