import { LanguageMap, LanguageMapType } from '@/shared/types/language-map.type';

/**
 * @enum ScopeCategoryType
 * @description Defines the string literals for different types of scopes.
 * These are the *specific identifiers* for each scope (e.g., 'syllabus').
 * This enum is used for type safety when referencing a particular scope.
 */
export enum ScopeCategoryType {
  SYLLABUS = 'syllabus', // Corresponds to 'Temario'
  EXAM = 'exam', // Corresponds to 'Examen'
  NEWS = 'news', // Corresponds to 'Noticia'
  INFORMATION = 'information', // Corresponds to 'Información'
}

/**
 * @constant SCOPE_DATA_TYPE_IDENTIFIER
 * @description
 * A constant string used as the 'type' property within `LanguageMapType`
 * to identify that the `languageMap` refers to a 'Category Scope'.
 * This indicates the *semantic type* of the localized data, not the specific scope value.
 */
export const SCOPE_DATA_TYPE_IDENTIFIER = 'question';

/**
 * @constant SCOPE_CATEGORY_DEFINITIONS
 * @description
 * Provides the full `LanguageMapType` definitions for each `ScopeCategoryType`.
 * Each definition associates a specific `ScopeCategoryType` (e.g., SYLLABUS) with
 * its localized display names (`languageMap`).
 *
 * The `type` property within each `LanguageMapType` object consistently identifies
 * that these definitions pertain to a 'Category Scope'.
 */
export const SCOPE_CATEGORY_DEFINITIONS: {
  [key in ScopeCategoryType]: LanguageMapType;
} = {
  [ScopeCategoryType.SYLLABUS]: {
    type: SCOPE_DATA_TYPE_IDENTIFIER, // CORRECTED: Use the descriptive identifier
    languageMap: {
      en: 'Question',
      es: 'Pregunta',
      //   en: 'Syllabus',
      //   es: 'Temario',
    },
  },
  [ScopeCategoryType.EXAM]: {
    type: SCOPE_DATA_TYPE_IDENTIFIER,
    languageMap: {
      en: 'Exam',
      es: 'Examen',
    },
  },
  [ScopeCategoryType.NEWS]: {
    type: SCOPE_DATA_TYPE_IDENTIFIER,
    languageMap: {
      en: 'News',
      es: 'Noticia',
    },
  },
  [ScopeCategoryType.INFORMATION]: {
    type: SCOPE_DATA_TYPE_IDENTIFIER,
    languageMap: {
      en: 'Information',
      es: 'Información',
    },
  },
};

/**
 * Utility function to retrieve a specific scope definition by its type.
 * @param type The ScopeCategoryType (e.g., 'syllabus') to retrieve.
 * @returns The LanguageMapType object for the given scope, or undefined if not found.
 */
export function getScopeCategoryDefinition(
  type: ScopeCategoryType,
): LanguageMapType | undefined {
  return SCOPE_CATEGORY_DEFINITIONS[type];
}
