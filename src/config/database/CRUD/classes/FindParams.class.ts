import { FilterQuery, PopulateOptions, SortOrder } from 'mongoose';

/**
 * Class representing the parameters for a find operation.
 * @template T - The type of the entity being queried.
 */
export class FindParams<T> {
  filterOptions: FilterQuery<T>;
  populateOptions: (Extract<keyof T, string> | PopulateOptions)[];
  selectOptions: Extract<keyof T, string>[] | string[];
  sortOptions: Partial<Record<Extract<keyof T, string>, SortOrder>>;
  triggerError: boolean;

  /**
   * Creates an instance of FindParams.
   * @param {Partial<FindParams<T>>} params - The parameters for the find operation.
   * @param {Partial<T>} [params.filterOptions] - The filter options for the query.
   * @param {(Extract<keyof T, string> | PopulateOptions)[]} [params.populateOptions] - The populate options for the query.
   * @param {Extract<keyof T, string>[]} [params.selectOptions] - The select options for the query.
   * @param {boolean} [params.triggerError] - Flag to trigger an error.
   */
  constructor(params: Partial<FindParams<T>>) {
    const {
      filterOptions,
      populateOptions,
      selectOptions,
      triggerError,
      sortOptions,
    } = params;
    this.filterOptions = filterOptions || {};
    this.populateOptions = populateOptions || [];
    this.selectOptions = selectOptions || [];
    this.triggerError = triggerError || true;
    this.sortOptions = sortOptions || {};
  }
}
