import { FindParams } from '../classes/FindParams.class';
import { PaginatedResult } from '../classes/PaginatedResult.class';
import { PaginationParamsDto } from '../dto/pagination-params.dto';

/**
 *
 * @author Joel
 * @date 04/08/2024
 * @description Interface for CRUD services to implement the basic CRUD operations
 * @export
 * @interface ICRUDService
 * @template T The type of the entity to be manipulated
 */
export interface ICRUDService<T> {
  findAll(
    findParams: FindParams<T>,
    paginationParams: PaginationParamsDto<T>,
  ): Promise<T[]>;

  findOne(params: FindParams<T>): Promise<T | null>;

  findOneOrCreate(params: FindParams<T>, dto: any): Promise<T>;

  create(dto: any): Promise<T>;

  update(id: string, dto: any): Promise<T>;

  remove(id: any): Promise<void>;
}
