// filter-builder.ts

import { CategoriesService } from '@/modules/categories/categories.service';
import { ExamTypesService } from '@/modules/exam-types/exam-types.service';
import { ExamsService } from '@/modules/exams/exams.service';
import { InformationService } from '@/modules/information/information.service';

type FilterHandler = (value: string) => Promise<Record<string, any>>;

/**
 * @description This class is used to build a mongo filter from a filterOptions object.
 * It uses the services provided to handle the filterOptions.
 * If a service is not provided, it will not be used.
 * @author Damian
 * @date 18/06/2025
 * @export
 * @class FilterBuilder
 */
export class FilterBuilder {
  private handlers: Record<string, FilterHandler> = {};

  constructor(
    private readonly services: {
      categoriesService?: CategoriesService;
      examsService?: ExamsService;
      examTypesService?: ExamTypesService;
      informationService?: InformationService;
    },
  ) {
    this.handlers['topics'] = this.handleTopics;
    this.handlers['categories'] = this.handleCategory;
    this.handlers['title'] = this.handleTitle;
  }

  /**
   * @description This function builds a mongo filter from a filterOptions object.
   * It uses the services provided to handle the filterOptions.
   * If a service is not provided, it will not be used.
   * @author Damian
   * @date 18/06/2025
   * @param {Record<string, string>} filterOptions
   * @returns {*}
   * @memberof FilterBuilder
   */
  async build(filterOptions: Record<string, string>) {
    const mongoFilter: Record<string, any> = {};

    for (const key of Object.keys(filterOptions)) {
      const handler = this.handlers[key];
      if (handler) {
        const partialFilter = await handler.call(this, filterOptions[key]);
        Object.assign(mongoFilter, partialFilter);
      } else {
        Object.assign(mongoFilter, { [key]: filterOptions[key] });
      }
    }

    return mongoFilter;
  }

  private async handleCategory(value: string): Promise<Record<string, any>> {
    const service = this.services.categoriesService;
    if (!service) {
      return;
    }

    const ids = await Promise.all(
      value.split(',').map(async (cat) => {
        const result = await this.services.categoriesService.findOneByID(cat);
        return result._id;
      }),
    );
    return { categories: { $in: ids } };
  }

  private async handleTopics(value: string): Promise<Record<string, any>> {
    const service = this.services.categoriesService;
    if (!service) {
      return;
    }

    const ids = await Promise.all(
      value.split(',').map(async (cat) => {
        const result = await this.services.categoriesService.findOneByID(cat);
        return result._id;
      }),
    );
    return { topics: { $in: ids } };
  }

  private async handleTitle(value: string): Promise<Record<string, any>> {
    const service = this.services.informationService;
    if (!service) {
      return;
    }
    const infos =
      await this.services.informationService.findAllInformationByTitle(value);
    return { information: { $in: infos.map((i) => i._id) } };
  }
}
