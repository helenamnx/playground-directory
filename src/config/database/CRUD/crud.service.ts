// Import necessary modules from Mongoose and NestJS
import { Model, PopulateOptions } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { ICRUDService } from './interfaces/crud.interface';
import { formatSearchedParams } from './utils/format-searched-params.utils';
import { PaginatedResult } from './classes/PaginatedResult.class';
import { PaginationParamsDto } from './dto/pagination-params.dto';
import { PaginationParams } from './classes/PaginationParams.class';
import { FindParams } from './classes/FindParams.class';
import {
  NotFoundCustomResponse,
  BadRequestCustomResponse,
} from 'src/shared/responses/error/custom-error-response';
import { CustomErrorKeys } from 'src/shared/enums/error-keys.enum';

/**
 * @description CRUD service to implement the basic CRUD operations
 * @template T The type of the entity to be manipulated
 */
@Injectable()
export class CRUDService<T> implements ICRUDService<T> {
  // Logger instance for logging purposes
  private readonly logger: Logger;
  private readonly modelName: Model<T>['modelName'];

  /**
   * Creates an instance of CRUDService.
   * @param {Model<T>} model - The Mongoose model to be used for CRUD operations.
   */
  constructor(private readonly model: Model<T>) {
    // Create a new instance of the logger with the name of the service invoked by the constructor
    this.logger = new Logger(this.constructor.name);
    // Set the model name to be used in the error messages
    this.modelName = this.model.modelName;
  }

  /**
   * Retrieves all documents based on the provided parameters and pagination options.
   * @param {Partial<FindParams<T>>} findParams - The parameters to find the documents.
   * @param {PaginationParamsDto<T>} [paginationParams] - The pagination parameters.
   * @returns {Promise<PaginatedResult<T>>} A promise that resolves to the paginated result.
   */
  async findAll(
    findParams: Partial<FindParams<T>>,
    paginationParams?: PaginationParamsDto<T>,
  ): Promise<T[]> {
    // Destructure findParams and set default values
    const { filterOptions, populateOptions, selectOptions, triggerError } =
      new FindParams<T>(findParams);

    // Destructure paginationParams and set default values
    const { currentPage, sortOptions, limit } = new PaginationParams<T>(
      paginationParams,
    );

    // Get the total number of documents in the collection filtered by the provided options
    const totalDocs = await this.model.countDocuments(filterOptions).exec();

    // Calculate the number of documents to skip based on the current page and limit
    const skip = (currentPage - 1) * limit;

    const data: T[] = await this.model
      .find(filterOptions)
      // Use dynamic populate options
      .populate(populateOptions)
      // Use dynamic select options
      .select(selectOptions)
      // Use dynamic sort options
      .sort(sortOptions)
      // Use dynamic skip value
      .skip(skip)
      // Use dynamic limit
      .limit(limit)
      .exec();

    const paginatedResult = new PaginatedResult<T>(data, {
      totalDocs,
      currentPage,
      limit,
    });

    return data;
  }

  /**
   * Retrieves a single document based on the provided parameters.
   * @param {FindParams<T>} params - The parameters to find the document.
   * @returns {Promise<T | null>} A promise that resolves to the document if found, or null if not found.
   */
  async findOne(params: Partial<FindParams<T>>): Promise<T | null> {
    // Destructure params and set default values
    const {
      filterOptions,
      populateOptions = [],
      selectOptions = [],
      triggerError = true,
      sortOptions = {},
    } = params;

    const entity = await this.model
      // Use dynamic find params
      .findOne(filterOptions)
      // Use dynamic populate options
      .populate(populateOptions)
      // Use dynamic select options
      .select(selectOptions)
      .sort(sortOptions)
      .exec();

    // If entity not found and triggerError is true, throw error
    if (!entity && triggerError) {
      // Format searched params
      const searchedParams = formatSearchedParams(params.filterOptions);
      // Get the error key from the CustomErrorKeys enum
      const errorKey =
        `${this.modelName.toUpperCase()}_NOT_FOUND` as keyof typeof CustomErrorKeys;
      // Throw a NotFoundCustomResponse error
      throw new NotFoundCustomResponse({
        title: `${this.modelName} not found`,
        key: CustomErrorKeys[errorKey],
        detail: `${this.modelName} with params: ${searchedParams} not found`,
      });
    }

    // Return the found entity or null
    return entity;
  }

  /**
   * Retrieves a single document based on the provided parameters or creates a new one if it doesn't exist.
   * @param {FindParams<T>} params - The parameters to find the document.
   * @param {any} dto - The data transfer object containing the data to create the document.
   * @returns {Promise<T>} A promise that resolves to the found or created document.
   */
  async findOneOrCreate(params: FindParams<T>, dto: any): Promise<T> {
    // Set triggerError to false to avoid throwing error if entity not found
    params.triggerError = false;

    // Find the entity based on the provided params
    const entity = await this.findOne(params);

    if (entity) {
      // Format searched params
      const searchedParams = formatSearchedParams(params.filterOptions);
      throw new BadRequestCustomResponse({
        title: `${this.modelName} already exists`,
        key: CustomErrorKeys.USER_ALREADY_EXISTS,
        detail: `${this.modelName} with params: ${searchedParams} already exists`,
      });
    }

    // If entity not found, create a new one
    if (!entity) {
      const createdEntity = await this.create(dto);
      if (!createdEntity) {
        throw new Error('Entity not created');
      }
      // Return the created entity
      return createdEntity;
    }
    // Return the found entity
    return entity;
  }

  /**
   * Creates a new document in the collection.
   * @param {any} dto - The data transfer object containing the data to create the document.
   * @returns {Promise<T>} A promise that resolves to the created document.
   * @throws {Error} If the document is not created.
   */
  async create(dto: any): Promise<T> {
    const createdEntity = await this.model.create(dto);
    if (!createdEntity) {
      throw new Error('Entity not created');
    }
    this.logger.log(`created-entity ${createdEntity}`);

    return createdEntity;
  }

  /**
   * Updates an existing document by its ID.
   * @param {string} _id - The ID of the document to update.
   * @param {any} dto - The data transfer object containing the updated data.
   * @returns {Promise<T>} A promise that resolves to the updated document.
   */
  async update(
    _id: string,
    dto: any,
    populateOptions?: (PopulateOptions | Extract<keyof T, string>)[],
  ): Promise<T> {
    let query = this.model.findOneAndUpdate(
      { _id },
      { ...dto, updatedAt: new Date() },
      { new: true },
    );

    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    const updatedEntity = await query;
    if (!updatedEntity) {
      // Format searched params
      const searchedParams = formatSearchedParams({ _id: _id });
      // Get the error key from the CustomErrorKeys enum
      const errorKey =
        `${this.modelName.toUpperCase()}_NOT_FOUND` as keyof typeof CustomErrorKeys;

      // Throw a NotFoundCustomResponse error
      throw new NotFoundCustomResponse({
        title: `${this.modelName} not found`,
        key: CustomErrorKeys[errorKey],
        detail: `${this.modelName} with ${searchedParams} not found`,
      });
    }
    this.logger.log(updatedEntity.toJSON());
    return updatedEntity;
  }

  /**
   * Removes a document by its ID.
   * @param {string} _id - The ID of the document to remove.
   * @returns {Promise<void>} A promise that resolves when the document is removed.
   */
  async remove(_id: string): Promise<void> {
    // Find the entity by its ID and remove it
    const user = await this.model.findOneAndDelete({ _id }).exec();

    // If entity not found, throw error
    if (!user) {
      // Format searched params
      const searchedParams = formatSearchedParams({ _id });
      // Get the error key from the CustomErrorKeys enum
      const errorKey =
        `${this.modelName.toUpperCase()}_NOT_FOUND` as keyof typeof CustomErrorKeys;

      // Throw a NotFoundCustomResponse error
      throw new NotFoundCustomResponse({
        title: `${this.modelName} not found`,
        key: CustomErrorKeys[errorKey],
        detail: `${this.modelName} with ${searchedParams} not found`,
      });
    }
  }
}
