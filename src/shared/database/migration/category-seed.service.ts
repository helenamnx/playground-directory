import { Injectable, Logger } from '@nestjs/common';
import { SpreadsheetService } from '@/shared/services/spreadsheet/spreadsheet.service';
import { CategoriesService } from '@/modules/categories/categories.service';
import {
  normalizeCategoryName,
  parseCategoryString,
} from '../utils/parser-category.util';
import {
  ScopeCategoryType,
  SCOPE_CATEGORY_DEFINITIONS,
} from '@/shared/enums/scope-category.enum';
import { LanguageMap } from '@/shared/types/language-map.type';
import { LanguagesEnum } from '@/shared/enums/languages.enum';
import { CategoryScopesService } from '@/modules/category-scopes/category-scopes.service';
/**
 * @class CategorySeedService
 * @description
 * This service is responsible for migrating category and subcategory data
 * from an Excel spreadsheet into the application's database. It handles
 * parsing the raw category strings, generating unique codes, and preventing
 * duplicate entries, including semantic duplicates where a subcategory's
 * name is too similar to its parent's name.
 */
@Injectable()
export class CategorySeedService {
  // Reinstated Logger as it was present in the original file, just removed the console.* replacements.
  private readonly logger = new Logger(CategorySeedService.name);

  // Shared state for the migration process. These maps and sets are used
  // to keep track of already processed categories and their relations
  // across different rows of the spreadsheet to avoid duplicates and
  // manage parent-child relationships effectively.
  private processedCategoryCodes = new Set<string>();
  private parentCategoryMap = new Map<string, any>(); // Maps parentCode to its created Category object
  private subcategoryCounters = new Map<string, number>(); // Stores the next sequential number for subcategories under each parent

  /**
   * @constructor
   * @param spreadsheetService Service to read data from spreadsheet files.
   * @param categoryService Service to interact with the categories in the database.
   */
  constructor(
    private readonly spreadsheetService: SpreadsheetService,
    private readonly categoryService: CategoriesService,
    private readonly categoryScopesService: CategoryScopesService,
  ) {}

  /**
   * Migrates categories and subcategories from a specified Excel file
   * to the database. It orchestrates the reading, parsing, and creation
   * of category entities by delegating to smaller, more focused private methods.
   *fgsdfgdfgsdfg
   * @param filePath The path to the Excel spreadsheet file.
   * @returns {Promise<void>} A promise that resolves when the migration is complete.
   */
  async migrateCategories(params: {
    filePath?: string;
    buffer?: Buffer;
    sheetName: string;
  }): Promise<void> {
    const { filePath, buffer, sheetName } = params;
    console.log('Starting category migration...');

    let rows: any[] = [];
    if (filePath) {
      rows = this.spreadsheetService.readSpreadsheetBySheetName(
        filePath,
        sheetName,
      );
    } else if (buffer) {
      rows = this.spreadsheetService.readSpreadsheetBySheetNameFromBuffer(
        buffer,
        sheetName,
      );
    }

    if (!rows || rows.length === 0) {
      console.log('El archivo Excel no tiene filas. Migración finalizada.');
      return;
    }

    //  Check if categories already exist
    if (filePath && !(await this.checkIfMigrationIsNeeded(filePath))) {
      console.log(
        'Migración de preguntas omitida (datos ya existentes o archivo vacío/inválido).',
      );
      return;
    }
    // Reset internal state for each migration run. This ensures that
    // previous runs do not affect the current one, and the sets/maps
    // are clean for a new migration.
    this.processedCategoryCodes = new Set<string>();
    this.parentCategoryMap = new Map<string, any>();
    this.subcategoryCounters = new Map<string, number>();
    // Define the scope for the categories being migrated.

    // Reset internal state for each migration run.

    for (const [index, row] of rows.entries()) {
      console.log(`--- Processing row ${index + 1} ---`);
      console.log(`Value of 'Categoría' in Excel: ${row['Categoría']}`);
      console.log(`Value of 'Subcategoria' in Excel: ${row['Subcategoria']}`);
      const categoryRaw = row['Categoría'];
      const subcategoryRaw = row['Subcategoria'];

      // Parse the raw category string to extract its code and name.
      const parsedCategory = parseCategoryString(categoryRaw);

      // If the parent category string format is invalid, log a warning and skip to the next row.
      if (!parsedCategory) {
        console.log(
          `Row ${index + 1}: Invalid parent category format: '${categoryRaw}'. Skipping.`,
        );
        continue;
      }

      // First, process the parent category. This method handles creation and
      // storing the parent category object in the map if it's new.
      await this.processParentCategory(parsedCategory);

      // Second, attempt to process the subcategory if it exists and a parent was parsed.
      // This method handles subcategory creation, code generation, and duplicate checks.
      await this.processSubcategory(index, subcategoryRaw, parsedCategory);
    }

    console.log('Category migration completed.');
  }

  /**
   * Handles the creation or retrieval of a parent category.
   * If the parent category (identified by its code) has not been processed yet,
   * it creates the category in the database and stores it in the `parentCategoryMap`.
   * It also initializes the subcategory counter for this parent.
   *
   * @param parsedCategory An object containing the extracted `code` and `name` of the parent category.
   * @private
   */
  private async processParentCategory(parsedCategory: {
    code: string;
    name: string;
  }): Promise<void> {
    const { code: parentCode, name: parentName } = parsedCategory;

    // Check if the parent category code has already been processed in this migration run.
    if (!this.processedCategoryCodes.has(parentCode)) {
      console.log(
        `Processing parent category: ${parentName} (Code: ${parentCode})`,
      );
      // Create a title object for the category, specifically for Spanish ('es').
      const title = { es: parentName };

      try {
        const syllabusScope =
          SCOPE_CATEGORY_DEFINITIONS[ScopeCategoryType.SYLLABUS];

        let storedCategoryScope = await this.categoryScopesService.findOne({
          filterOptions: {
            alias: syllabusScope.type,
          },
          triggerError: false,
        });
        if (!storedCategoryScope) {
          storedCategoryScope =
            await this.categoryScopesService.createCategoryScope({
              alias: syllabusScope.type,
              languageMap: syllabusScope.languageMap,
            });
        }
        //  create the parent category entity in the database.
        const parentCategory = await this.categoryService.createCategory(
          {
            code: parentCode,
            value: title[LanguagesEnum.ES],
            title,
            isActive: true, // Assuming all migrated categories are active by default.
            scope: storedCategoryScope._id, // Scope is not provided in the Excel data, so set to null.
            parentCategories: [], // Parent categories at the top level have no parent themselves.
            tags: [], // Tags are not provided in the Excel data.
          },
          LanguagesEnum.ES,
        );
        // Store the newly created parent category object in the map for efficient retrieval
        // when linking subcategories.
        this.parentCategoryMap.set(parentCode, parentCategory);
        // Add the parent category's unique code to the set of processed codes
        // to prevent re-creating it.
        this.processedCategoryCodes.add(parentCode);
        // Initialize the sequential counter for subcategories belonging to this parent.
        this.subcategoryCounters.set(parentCode, 0);
      } catch (error) {
        console.log(
          `Error creating parent category '${parentName}' with code '${parentCode}': ${error.message}`,
        );
      }
    }
  }

  /**
   * Handles the processing and creation of a subcategory.
   * It performs several checks:
   * 1. If the subcategory raw data is valid (not null/empty).
   * 2. If the associated parent category object has been successfully created and is available in the map.
   * 3. A semantic duplicate check: if the normalized subcategory name is too similar to the normalized parent name.
   * 4. If the exact subcategory (parentCode + originalSubcategoryName) has already been processed.
   * If all checks pass, it generates a sequential numeric code for the subcategory and creates it in the database.
   *
   * @param rowIndex The index of the current row being processed, used for specific logging.
   * @param subcategoryRaw The raw string value of the subcategory from the Excel sheet.
   * @param parsedParentCategory The parsed object of the parent category, containing its code and name.
   * @private
   */
  private async processSubcategory(
    rowIndex: number,
    subcategoryRaw: string,
    parsedParentCategory: { code: string; name: string },
  ): Promise<void> {
    const parentCode = parsedParentCategory.code;
    const parentCategory = this.parentCategoryMap.get(parentCode);

    // 1. Initial validation: Check if inputs are valid and parent exists.
    if (
      !this.validateSubcategoryInputs(
        rowIndex,
        subcategoryRaw,
        parentCode,
        parentCategory,
      )
    ) {
      return;
    }

    const currentSubcategoryName = subcategoryRaw.trim();

    // 2. Semantic Duplicate Check
    if (
      this.isSemanticDuplicate(
        rowIndex,
        currentSubcategoryName,
        parsedParentCategory,
      )
    ) {
      return;
    }

    const subcategoryUniqueKey = `${parentCode}-${currentSubcategoryName}`;

    // 3. Exact Duplicate Check
    if (
      this.hasSubcategoryBeenProcessed(
        subcategoryUniqueKey,
        currentSubcategoryName,
        parentCategory,
      )
    ) {
      return;
    }

    // 4. Prepare subcategory details (code generation, title creation, and logging).
    const { code: subcategoryCode, title: subcategoryTitle } =
      this.prepareSubcategoryProcessingDetails(
        parentCode,
        currentSubcategoryName,
        parentCategory,
      );

    try {
      const syllabusScope =
        SCOPE_CATEGORY_DEFINITIONS[ScopeCategoryType.SYLLABUS];

      let storedCategoryScope = await this.categoryScopesService.findOne({
        filterOptions: {
          alias: syllabusScope.type,
        },
        triggerError: false,
      });
      if (!storedCategoryScope) {
        storedCategoryScope =
          await this.categoryScopesService.createCategoryScope({
            alias: syllabusScope.type,
            languageMap: syllabusScope.languageMap,
          });
      }
      // Attempt to create the subcategory entity in the database.
      await this.categoryService.createCategory(
        {
          code: subcategoryCode,
          title: subcategoryTitle,
          isActive: true, // Assuming all migrated subcategories are active.
          scope: storedCategoryScope._id, // Adjusted to match the expected type.
          parentCategories: [parentCategory], // Link this subcategory to its actual parent category object.
          tags: [], // Tags are not provided.
        },
        LanguagesEnum.ES,
      );
      // Add the subcategory's unique key to the set of processed codes to prevent future duplicates.
      this.processedCategoryCodes.add(subcategoryUniqueKey);
    } catch (error) {
      console.log(
        `Error creating subcategory '${currentSubcategoryName}' with code '${subcategoryCode}': ${error.message}`,
      );
    }
  }

  /**
   * Validates initial inputs for subcategory processing.
   * Checks if `subcategoryRaw` is not empty and if the `parentCategory` object is available.
   * Logs warnings if conditions are not met.
   *
   * @param rowIndex The index of the current row being processed.
   * @param subcategoryRaw The raw string value of the subcategory.
   * @param parentCode The code of the parent category.
   * @param parentCategory The parent category object.
   * @returns {boolean} `true` if inputs are valid and processing can continue, `false` otherwise.
   * @private
   */
  private validateSubcategoryInputs(
    rowIndex: number,
    subcategoryRaw: string,
    parentCode: string,
    parentCategory: any,
  ): boolean {
    if (!subcategoryRaw || subcategoryRaw.trim() === '') {
      console.log(
        `Row ${rowIndex + 1}: Subcategory is empty or null. Skipping subcategory processing.`,
      );
      return false;
    }
    if (!parentCategory) {
      console.log(
        `Row ${rowIndex + 1}: Parent category with code '${parentCode}' not found in map for subcategory '${subcategoryRaw}'. Skipping subcategory creation.`,
      );
      return false;
    }
    return true;
  }

  /**
   * Generates a unique, sequential numeric code for a subcategory based on its parent's code.
   * Increments the counter for the specific parent and formats it with leading zeros.
   *
   * @param parentCode The code of the parent category.
   * @returns The generated sequential subcategory code (e.g., "01.01-01").
   * @private
   */
  private generateSubcategoryCode(parentCode: string): string {
    let counter = this.subcategoryCounters.get(parentCode) || 0;
    counter++;
    this.subcategoryCounters.set(parentCode, counter);

    const formattedCounter = String(counter).padStart(2, '0');
    return `${parentCode}-${formattedCounter}`;
  }

  /**
   * Performs a semantic duplicate check between the subcategory and its parent.
   * Logs a message if a semantic duplicate is detected.
   *
   * @param rowIndex The index of the current row being processed.
   * @param currentSubcategoryName The trimmed subcategory name.
   * @param parsedParentCategory The parsed parent category object.
   * @returns {boolean} `true` if it's a semantic duplicate and processing should stop, `false` otherwise.
   * @private
   */
  private isSemanticDuplicate(
    rowIndex: number,
    currentSubcategoryName: string,
    parsedParentCategory: { code: string; name: string },
  ): boolean {
    const normalizedSubcategoryName = normalizeCategoryName(
      currentSubcategoryName,
    );
    const normalizedParentNameForComparison = normalizeCategoryName(
      parsedParentCategory.name,
    );

    if (normalizedSubcategoryName === normalizedParentNameForComparison) {
      console.log(
        `Row ${rowIndex + 1}: Subcategory '${currentSubcategoryName}' (Normalized: '${normalizedSubcategoryName}') is identical or very similar to parent category name '${parsedParentCategory.name}' (Normalized: '${normalizedParentNameForComparison}'). Skipping subcategory creation.`,
      );
      return true;
    }
    return false;
  }

  /**
   * Checks if the exact subcategory (identified by its unique key) has already been processed
   * in the current migration run. Logs a message if a duplicate is found.
   *
   * @param subcategoryUniqueKey The unique key generated for the subcategory.
   * @param currentSubcategoryName The trimmed subcategory name.
   * @param parentCategory The parent category object (for logging purposes).
   * @returns {boolean} `true` if the subcategory has already been processed, `false` otherwise.
   * @private
   */
  private hasSubcategoryBeenProcessed(
    subcategoryUniqueKey: string,
    currentSubcategoryName: string,
    parentCategory: any,
  ): boolean {
    if (this.processedCategoryCodes.has(subcategoryUniqueKey)) {
      console.log(
        `Subcategory '${currentSubcategoryName}' under '${parentCategory.title?.es || 'Name Not Available'}' (Key: ${subcategoryUniqueKey}) already processed. Skipping.`,
      );
      return true;
    }
    return false;
  }
  /**
   * Checks if a database migration is necessary by looking for an existing category
   * based on the first entry in the spreadsheet.
   *
   * @param filePath The path to the Excel spreadsheet file.
   * @returns {Promise<boolean>} A promise that resolves to `true` if migration should proceed,
   * or `false` if categories already exist or the spreadsheet is empty/invalid.
   * @private
   */

  /**
   * Prepares subcategory details including generating its code, creating its title object,
   * and logging the processing information.
   *
   * @param parentCode The code of the parent category.
   * @param currentSubcategoryName The trimmed and cleaned name of the subcategory.
   * @param parentCategory The parent category object, used for logging its name.
   * @returns An object containing the generated `code` and the `title` for the subcategory.
   * @private
   */
  private prepareSubcategoryProcessingDetails(
    parentCode: string,
    currentSubcategoryName: string,
    parentCategory: any,
  ): { code: string; title: LanguageMap } {
    const subcategoryCode = this.generateSubcategoryCode(parentCode);
    console.log(
      `Processing subcategory: ${currentSubcategoryName} under ${parentCategory.title?.es || 'Name Not Available'} (Code: ${subcategoryCode})`,
    );
    const subcategoryTitle: LanguageMap = { es: currentSubcategoryName };
    return { code: subcategoryCode, title: subcategoryTitle };
  }

  /**
   * Checks if a database migration is necessary by looking for an existing category
   * based on the first entry in the spreadsheet.
   *
   * @param filePath The path to the Excel spreadsheet file.
   * @returns {Promise<boolean>} A promise that resolves to `true` if migration should proceed,
   * or `false` if categories already exist or the spreadsheet is empty/invalid.
   * @private
   */
  private async checkIfMigrationIsNeeded(filePath: string): Promise<boolean> {
    const firstRow = this.spreadsheetService.readSpreadsheetBySheetName(
      filePath,
      'Fase Presencial',
    )[0];

    if (!firstRow) {
      console.log(
        'Spreadsheet appears to be empty. No categories to migrate or check for existence.',
      );
      return false; // No data to migrate
    }

    const firstCategoryRaw = firstRow['Categoría'];
    const parsedFirstCategory = parseCategoryString(firstCategoryRaw);

    if (!parsedFirstCategory) {
      console.log(
        `Could not parse the first category string '${firstCategoryRaw}' from the spreadsheet to check for existing data. Proceeding with migration cautiously.`,
      );
      // Deciding whether to proceed or not if parsing fails on the first row.
      // Currently, it proceeds cautiously. If you want to stop the whole migration
      // if the first row is unparseable, change this to `return false;`.
      return true; // Still attempt migration, but log a warning.
    }

    const existingCategory = await this.categoryService.findOneByCode(
      parsedFirstCategory.code,
    );
    if (existingCategory) {
      console.log(
        `Categories already exist in the database (found category with code: ${parsedFirstCategory.code}). Skipping migration.`,
      );
      return false; // Migration not needed
    }

    return true; // Migration is needed
  }
}
