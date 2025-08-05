import { PropertiesEnum } from '../enums/properties.enum';

export type LanguageMap = Record<string, string>;

export type LanguageMapType = {
  type: string;
  languageMap: LanguageMap;
};
