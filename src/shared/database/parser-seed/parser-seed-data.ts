
import { CreateQuestionSeedDto } from '../dtos/create-question-seed.dto';
/**
 * @interface ParsedSeedData
 * @description
 * This interface defines the structure of the data after it has been parsed
 * from the raw Excel spreadsheet. It represents the structured, normalized
 * data that is ready to be consumed by the seeding services for insertion
 * into the database.
 * @property {CreateQuestionSeedDto[]} questions - An array of question data
 * objects, each structured according to the `CreateQuestionSeedDto`.
 * This array contains all the information extracted and transformed
 * from the Excel rows, including question text, answers, categories,
 * and configuration.
 */
export interface ParsedSeedData {
  questions: CreateQuestionSeedDto[];
}
