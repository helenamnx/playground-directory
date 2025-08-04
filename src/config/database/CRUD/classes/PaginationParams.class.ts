import { SortOrder } from "mongoose";
import { PaginationParamsDto } from "../dto/pagination-params.dto";

/**
 * Class representing the parameters for pagination.
 * @template T - The type of the entity being queried.
 */
export class PaginationParams<T> {
  currentPage: number;
  sortOptions: Record<keyof T, SortOrder> | {};
  limit: number;

  /**
   * Creates an instance of PaginationParams.
   * @param {PaginationParamsDto<T>} [params] - The parameters for pagination.
   * @param {number} [params.currentPage] - The current page number.
   * @param {Record<keyof T, SortOrder>} [params.sortOptions] - The sort options for the query.
   * @param {number} [params.limit] - The number of items per page.
   */
  constructor(params?: PaginationParamsDto<T>) {
    const { currentPage, sortOptions, limit } = params ?? {};
    this.currentPage = currentPage || 1;
    this.sortOptions = sortOptions || {};
    this.limit = limit || 10;
  }
}
