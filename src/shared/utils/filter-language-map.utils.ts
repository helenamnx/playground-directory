import ownPlatformMockDev from '@/shared/database/data/seed-mocks/development-seed/own-platform.mock.json';
import { PropertiesEnum } from '../enums/properties.enum';

/**
 * Filters and replaces LanguageMap fields in an object with the corresponding value for the specified language.
 * If the language is "all", it returns the full LanguageMap object.
 * If no language is provided, it defaults to the platform's default language.
 * @param {any} item - The object to process, which may contain nested LanguageMap fields.
 * @param {string} [lang] - The language code to filter the LanguageMap fields (e.g., 'en', 'es', 'all').
 * @param {string[]} languageMapFields - The list of fields that are considered LanguageMap fields.
 * @returns {any} The processed object with LanguageMap fields replaced by the corresponding language value or the full LanguageMap.
 */

const languageMapFields = [
  'name',
  'description',
  'title',
  'subtitle',
  'body',
  'slug',
  'observations',
  'languageMap',
  'value',
  'status',
  'justification',
];
export const filterLanguageMap = (item: any, lang: string): any => {
  try {
    // Create a deep copy of the object to avoid mutating the original
    const copy = Array.isArray(item) ? [...item] : { ...item };
    for (const key in copy) {
      if (copy.hasOwnProperty(key)) {
        // Check if the property is an object
        if (
          typeof copy[key] === 'object' &&
          copy[key] !== null &&
          !(copy[key] instanceof Date)
        ) {
          // If the property is a LanguageMap field
          if (languageMapFields.includes(key)) {
            if (lang === 'all') {
              // Keep the full LanguageMap if "all" is specified
              continue;
            } else {
              if (copy[key].type === PropertiesEnum.LANGUAGE_MAP_PROPERTY) {
                if (copy[key].languageMap) {
                  // Replace with the value for the specified language or undefined
                  copy[key] = copy[key].languageMap[lang]
                    ? copy[key].languageMap[lang]
                    : undefined;
                }
              }
            }
          } else {
            // Recursively process nested objects and pass the selectedLang
            copy[key] = filterLanguageMap(copy[key], lang);
          }
        }
      }
    }
    return copy;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const newFilterLanguageMap = (
  item: any,
  lang: string,
  seen = new Set(),
): any => {
  try {
    // Evita ciclos: si el objeto ya se procesó, devuélvelo tal cual
    if (item && typeof item === 'object') {
      if (seen.has(item)) {
        return item;
      }
      seen.add(item);
    }

    const copy = Array.isArray(item) ? [] : {};
    for (const key in item) {
      if (!item.hasOwnProperty(key)) continue;

      const value = item[key];

      if (
        typeof value === 'object' &&
        value !== null &&
        !(value instanceof Date)
      ) {
        if (languageMapFields.includes(key)) {
          if (lang === 'all') {
            copy[key] = value;
          } else if (value.type === PropertiesEnum.LANGUAGE_MAP_PROPERTY) {
            copy[key] = value.languageMap?.[lang] ?? undefined;
          } else {
            copy[key] = value;
          }
        } else {
          copy[key] = newFilterLanguageMap(value, lang, seen);
        }
      } else {
        copy[key] = value;
      }
    }

    return copy;
  } catch (e) {
    console.error('filterLanguageMap error:', e);
    throw e;
  }
};
