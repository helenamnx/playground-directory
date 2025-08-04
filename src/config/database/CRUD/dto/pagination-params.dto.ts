import { SortOrder } from 'mongoose';

/**
 *
 * @author Joel
 * @date 04/08/2024
 * @description Interface for the find params to be used in the find operations
 * @export
 * @interface PaginationParamsDto
 * @template T
 */

export interface PaginationParamsDto<T> {
  currentPage?: number;
  sortOptions?: Partial<Record<keyof T, SortOrder>>;
  limit?: number;
}
