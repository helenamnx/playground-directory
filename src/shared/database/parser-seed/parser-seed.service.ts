
import { Injectable, Logger } from '@nestjs/common';
import { ParsedSeedData } from './parser-seed-data';
import { SpreadsheetService } from '@/shared/services/spreadsheet/spreadsheet.service';
import { mapDifficulty } from '@/shared/utils/difficulty-map.util';

/**
 * @class SeedParserService
 * @description
 * This service is responsible for parsing raw data from an Excel spreadsheet
 * into a structured format suitable for seeding the application's database.
 *
 * In this specific case, the `SeedParserService` takes the raw rows from the `SpreadsheetService`
 * and maps them into a `ParsedSeedData` structure, specifically preparing question,
 * category, and answer option entities with their respective properties.
 */
@Injectable()
export class SeedParserService {
  private readonly logger = new Logger(SeedParserService.name);

  constructor(private readonly spreadsheetService: SpreadsheetService) { }

  /**
   * Parses the spreadsheet file and transforms its rows into a structured
   * `ParsedSeedData` object, ready for database seeding.
   *
   * @param filePath The path to the Excel spreadsheet file.
   * @returns A `ParsedSeedData` object containing questions, categories, and answer options.
   */
  parse(filePath: string): ParsedSeedData {
    this.logger.log(`Parsing spreadsheet file: ${filePath}`);
    // Reads all rows from the specified sheet in the Excel file.
    // 'Fase Presencial' is the sheet name assumed to contain the relevant data.
    const rows = this.spreadsheetService.readSpreadsheetBySheetName(
      filePath,
      'Fase Presencial',
    );



    return {
      questions: rows.map((row) => ({
        // Maps the textual difficulty from the spreadsheet to a standardized string representation.
        difficulty: mapDifficulty(row['Dificultad (1Baja; 2Media;3Alta;4Extrema)']).toString(),
        // Extracts general information about the question.
        information: {
          title: row['Título pregunta'],
          author: null,
          alias: null,
          content: null,
        },
        // Processes categories and subcategories associated with the question.
        // Note: The category/subcategory parsing for 'code' and 'name'
        // is handled in `CategorySeedService` based on previous iterations,
        // so here we just pass the raw string for the title.
        categories: [
          {
            title: row['Categoría'],
            isActive: true,
            scope: null,
            parentCategories: [],
            tags: [],
          },
          {
            title: row['Subcategoria'],
            isActive: true,
            scope: null,
            parentCategories: [],
            tags: [],
          },
        ],
        questionConfiguration: {
          negativeMarking: false,
          partialMarking: false,
          timed: false,
          timeLimit: null,
          weight: 1,
        },
        answerOptions: [
          {
            value: row['Respuesta 1'],
            isCorrect: row['Respuesta correcta'] === 1,
            justification: row['Justificación'],
          },
          {
            value: row['Respuesta 2'],
            isCorrect: row['Respuesta correcta'] === 2,
            justification: row['Justificación'],
          },
          {
            value: row['Respuesta 3'],
            isCorrect: row['Respuesta correcta'] === 3,
            justification: row['Justificación'],
          },
          {
            value: row['Respuesta 4'],
            isCorrect: row['Respuesta correcta'] === 4,
            justification: row['Justificación'],
          },
        ],
      })),
    };
  }
}