import { AppUser } from '@/modules/app-users/schemas/app-user.schema';
import { CustomErrorKeys } from '../enums/error-keys.enum';
import {
  BadRequestCustomResponse,
  UnauthorizedCustomResponse,
} from '../responses/error/custom-error-response';
import { LanguageMap, LanguageMapType } from '../types/language-map.type';
import { PropertiesEnum } from '../enums/properties.enum';
import {
  isAfter,
  isBefore,
  parse,
  diffMilliseconds,
  isEqual,
  tzDate,
} from '@formkit/tempo';
import { User } from '@/modules/users/schemas/user.schema';
import { Category } from '@/modules/categories/schemas/category.schema';
import { TopicsWithParent } from '@/modules/exams/interfaces/exam.interface';
import { RolesEnum } from '../enums/roles.enum';
import { CreateInformationDto } from '@/modules/information/dto/create-information.dto';
import { Question } from '@/modules/questions/schemas/question.schema';
import { Information } from '@/modules/information/schema/information.schema';
import { ModerationStatus } from '@/modules/moderation-status/schemas/moderation-status.schema';
import { ModerationStatusAliasEnum } from '../enums/moderation-status.enum';

export function minutesToMiliseconds(minutes: number): number {
  return minutes * 60 * 1000;
}

export function secondsToMinutes(seconds: number): number {
  return Math.floor(seconds / 60);
}

export function nextDay() {
  // Obtener la fecha actual
  let fechaActual = new Date();
  // Sumar un día
  fechaActual.setDate(fechaActual.getDate() + 1);
  return fechaActual;
}

export function isDateExpired(expireDate: Date): boolean {
  // Obtener la fecha actual
  const dateNow = new Date();

  // Convertir expireDate a un objeto Date
  // Comprobar si la fecha de expiración es mayor que la fecha actual
  return dateNow > expireDate;
}

/**
 * Validates if a given string is a valid Spanish DNI (Documento Nacional de Identidad).
 * It checks both the format (8 digits + 1 letter) and the correctness of the control letter.
 * Does not validate NIEs (Foreigner Identification Numbers) or CIFs (Company Tax Identification Codes).
 *
 * @param {string} dni - The string representing the DNI to validate.
 * @returns {boolean} - True if the DNI is valid, false otherwise.
 */
export function isValidDNI(dni: string): boolean {
  // Added explicit return type for clarity
  if (typeof dni !== 'string') {
    return false; // Not a string
  }

  // 1. Remove whitespace and convert to uppercase
  dni = dni.trim().toUpperCase();

  // 2. Check the format: 8 digits + 1 letter
  // Regular expression: ^ (start of string)
  //                     \d{8} (exactly 8 digits)
  //                     [TRWAGMYFPDXBNJZSQVHLCKE] (one of the allowed control letters)
  //                     $ (end of string)
  const dniRegex = /^\d{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
  if (!dniRegex.test(dni)) {
    return false; // Does not meet the basic format requirements
  }

  // 3. Separate the numbers and the letter
  const numbers = dni.substring(0, 8);
  const letter = dni.substring(8, 9);

  // 4. Calculate the expected letter
  const dniNumbers = parseInt(numbers, 10);
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const expectedLetter = letters.charAt(dniNumbers % 23);

  // 5. Compare the provided letter with the expected letter
  return letter === expectedLetter;
}

export function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();
}

/**
 * @description This function check if the user has the provided roles and scopes
 * @author Damian
 * @date 13/06/2025
 * @export
 * @param {{
 *   appUser: AppUser;
 *   roles?: string[];
 * }} params
 * @returns {*}
 */
export function checkCapabilities(params: {
  appUser: AppUser;
  roles?: string[];
}) {
  const { appUser, roles } = params;
  if (
    roles &&
    appUser.user.roles.some((userRole) =>
      roles.includes(userRole.alias.toLowerCase()),
    )
  ) {
    return true;
  } else {
    throw new UnauthorizedCustomResponse({
      title: 'User does not has permissions',
      key: CustomErrorKeys.UNAUTHORIZED,
      detail: 'User does not has permissions',
    });
  }

  //TODO: check scopes
}

/**
 * @description This function get the language map value
 * @author Damian
 * @date 17/06/2025
 * @export
 * @param {LanguageMap} languageMap
 * @param {string} language
 * @returns {*}  {string}
 */
export function getLanguageMapValue(
  languageMap: LanguageMap,
  language: string,
): string {
  return languageMap[language];
}

export function transformToLanguageMapType(
  languageMap: LanguageMap,
): LanguageMapType {
  return {
    type: PropertiesEnum.LANGUAGE_MAP_PROPERTY,
    languageMap,
  };
}

/**
 * @description This function generate a random number with the provided length
 * @author Damian
 * @date 20/06/2025
 * @param {number} length
 * @exports
 * @returns {*}  {number}
 */
export function generateRandomNumber(length: number): number {
  if (length <= 0) {
    return 0;
  }

  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @description This function returns the last item of an array.
 * @author Damian
 * @date 20/06/2025
 * @export
 * @template T
 * @param {T[]} array
 * @returns {*}
 */

export function getLastArrayItem<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

/**
 * @description This function checks if an array has duplicated items.
 * @author Damian
 * @date 20/06/2025
 * @export
 * @template T
 * @param {T[]} array
 * @returns {*}  {boolean}
 */
export function hasArrayDuplicatedItems<T>(array: T[]) {
  const set = new Set(array);
  return set.size !== array.length;
}

// Opción 3: Usando type guards para mejor inferencia de tipos
function isStringArray<T>(array: T[]): array is Extract<T, string>[] {
  return typeof array[0] === 'string';
}

function isObjectArray<T>(array: T[]): array is Extract<T, { _id: string }>[] {
  return typeof array[0] === 'object' && array[0] !== null && '_id' in array[0];
}

export function clearArrayDuplicates<T extends string | { _id: string }>(
  array: T[],
): T[] {
  if (array.length === 0) {
    return [];
  }

  if (isStringArray(array)) {
    // TypeScript sabe que array es string[] aquí
    return Array.from(new Set(array)) as T[];
  } else if (isObjectArray(array)) {
    // TypeScript sabe que array es { _id: string }[] aquí
    return array.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t._id === item._id),
    ) as T[];
  }

  return array;
}

/**
 * Compara si la hora de `dateA` está antes que la de `dateB`, solo considerando minutos (HH:mm).
 */
export function isTimeBefore(dateA: Date, dateB: Date): boolean {
  const hA = dateA.getHours().toString().padStart(2, '0');
  const mA = dateA.getMinutes().toString().padStart(2, '0');
  const hB = dateB.getHours().toString().padStart(2, '0');
  const mB = dateB.getMinutes().toString().padStart(2, '0');

  const timeA = parse(`1970-01-01T${hA}:${mA}`);
  const timeB = parse(`1970-01-01T${hB}:${mB}`);
  return isBefore(timeA, timeB);
}

/**
 * @description This function merges the attributes of two objects. It deletes the _id, createdAt, updatedAt, __v properties.
 * @author Damian
 * @date 25/06/2025
 * @export
 * @template T
 * @param {T} target
 * @param {*} defaultObject
 * @returns {*}  {T}
 */
export function mergeAttributes<T>(target: T, defaultObject: any): T {
  const result: any = { ...defaultObject };

  for (const key in target) {
    const value = target[key];
    if (value !== null && value !== undefined) {
      result[key] = value;
    }
  }

  delete result._id;
  delete result.createdAt;
  delete result.updatedAt;
  delete result.__v;

  return result as T;
}

/**
 * @description This function checks if the dateTimeToCheck is in between the startDateTime and the endDateTime.
 * @author Damian
 * @date 25/06/2025
 * @private
 * @param {Date} dateTimeToCheck //the dateTime to compare
 * @param {Date} startDateTime
 * @param {Date} endDateTime
 */
export function isDateTimeIsInBetweenTwoDates(
  dateTimeToCheck: Date, //the dateTime to compare
  startDateTime: Date,
  endDateTime: Date,
): boolean {
  //if the startTime is before the start date of the exam or after the end date of the exam, return true
  if (
    isBefore(dateTimeToCheck, startDateTime) ||
    isAfter(dateTimeToCheck, endDateTime)
  ) {
    return false;
  }
  // if the startTime is the same day as the exam start date, check if the time is before the exam start time
  if (
    isEqual(dateTimeToCheck, startDateTime) &&
    isTimeBefore(dateTimeToCheck, startDateTime)
  ) {
    return false;
  }

  // if the startTime is the same day as the exam end date, check if the time is after the exam end time
  if (
    isEqual(dateTimeToCheck, endDateTime) &&
    isTimeBefore(endDateTime, dateTimeToCheck)
  ) {
    return false;
  }

  return true;
}

/**
 * @description This function checks if the dateToCheck is before the date.
 * If the dateToCheck is the same day and the time is before the date, it returns true.
 * @author Damian
 * @date 22/07/2025
 * @export
 * @param {Date} dateToCheck
 * @param {Date} date
 * @returns {*}  {boolean}
 */
export function isDateIsBefore(dateToCheck: Date, date: Date): boolean {
  //if date is before, return true
  if (isBefore(dateToCheck, date)) return true;
  //if is the same day and the time is before the date, return true
  if (isEqual(dateToCheck, date) && isTimeBefore(dateToCheck, date))
    return true;
  return false;
}

/**
 * @description This function sums two numbers.
 * @author Damian
 * @date 25/06/2025
 * @export
 * @param {number} number1
 * @param {number} number2
 * @returns {*}  {number}
 */
export function sumNumbers(number1: number, number2: number): number {
  return number1 + number2;
}

/**
 * @description This function multiplies two numbers.
 * @author Damian
 * @date 25/06/2025
 * @export
 * @param {number} number1
 * @param {number} number2
 * @returns {*}  {number}
 */
export function multiplyNumbers(number1: number, number2: number): number {
  return number1 * number2;
}

/**
 * @description This function divides two numbers.
 * @author Damian
 * @date 25/06/2025
 * @export
 * @param {number} number1
 * @param {number} number2
 * @returns {*}  {number}
 */
export function divideNumbers(number1: number, number2: number): number {
  return number1 / number2;
}

/**
 * @description This function subtracts two numbers.
 * @author Damian
 * @date 25/06/2025
 * @export
 * @param {number} number1
 * @param {number} number2
 * @returns {*}  {number}
 */
export function subtractNumbers(number1: number, number2: number): number {
  return number1 - number2;
}

/**
 * @description This function checks if the duration of the exam is greater than the examAttemptEndTime.
 * @author Damian
 * @date 25/06/2025
 * @export
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {number} durationMs
 * @returns {*}  {boolean}
 */
export function isTimeGreaterThanDuration(
  startDate: Date,
  endDate: Date,
  durationMs: number,
): boolean {
  const dif = diffMilliseconds(startDate, endDate);
  return dif > durationMs;
}

/**
 * @description This function rounds a number to a given number of decimals.
 * @author Damian
 * @date 26/06/2025
 * @export
 * @param {number} value
 * @param {number} [decimals=2]
 * @returns {*}  {number}
 */
export function roundTo(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * @description This function calculates the time remaining for the exam attempt.
 * @author Damian
 * @date 30/06/2025
 * @export
 * @param {({
 *   startTime: Date;
 *   examStartDate: Date;
 *   examEndDate: Date;
 *   examDuration: number | null;
 * })} {
 *   startTime,
 *   examStartDate,
 *   examEndDate,
 *   examDuration, // en milisegundos o null
 * }
 * @returns {*}  {number}
 */ export function calculateTimeRemaining({
  startTime,
  examStartDate,
  examEndDate,
  examDuration,
}: {
  startTime: Date;
  examStartDate: Date | null;
  examEndDate: Date | null;
  examDuration: number | null;
}): number | null {
  const now = Date.now();
  const startTimeMs = startTime.getTime();

  // Calcular fecha límite según duración
  const durationLimit =
    examDuration !== null ? startTimeMs + examDuration : Infinity;
  //calculate the startDate and endDate if provided
  const examStartDateMs = examStartDate ? examStartDate!.getTime() : -Infinity;
  const examEndDateMs = examEndDate ? examEndDate!.getTime() : Infinity;

  // Validar si estamos fuera de la ventana permitida
  if (now < examStartDateMs || now > examEndDateMs) {
    return 0;
  }

  // Calcular el tiempo límite real
  const effectiveEndTime = Math.min(durationLimit, examEndDateMs);

  const timeRemaining = effectiveEndTime - now;
  return Number.isNaN(timeRemaining) ? null : Math.max(0, timeRemaining); // siempre positivo
}

/**
 * @description This function converts a phone number to E.164 format.
 * @author Damian
 * @date 02/07/2025
 * @export
 * @param {string} phone
 * @param {string} [defaultCountryCode='34']
 * @returns {*}  {string}
 */
export function toE164(
  phone: string,
  defaultCountryCode: string = '34', //TODO: sacar string a pelo
): string {
  const trimmed = phone.trim();

  if (trimmed.startsWith('+')) {
    return trimmed;
  }

  if (trimmed.startsWith('00')) {
    return '+' + trimmed.slice(2);
  }

  return `+${defaultCountryCode}${trimmed}`;
}

/**
 * @description This function returns a slice of an array, omitting the first n elements.
 * @author Damian
 * @date 02/07/2025
 * @export
 * @template T
 * @param {T[]} array
 * @param {number} omitCount
 * @returns {*}  {T[]}
 */
export function sliceFrom<T>(array: T[], omitCount: number): T[] {
  return array.slice(omitCount);
}

/**
 * @description This function checks if the provided value is a number.
 * @author Damian
 * @date 02/07/2025
 * @export
 * @param {string} value
 * @returns {*}  {boolean}
 */
export function isNumeric(value: string): boolean {
  if (typeof value !== 'string') return false;
  const number = Number(value);
  return !isNaN(number) && isFinite(number);
}

//TODO: pasar por prop el tipo de normalizado que se quiere hacer.
export function normalizeUsername(raw: string): string | null {
  return raw
    .trim() // eliminar espacios al inicio y final
    .toLowerCase()
    .replace(/\s+/g, '_') // reemplazar espacios internos por guiones bajos
    .replace(/[^a-z0-9._-]/gi, ''); // eliminar otros caracteres no permitidos
}

export const convertToUTC = (date: Date, timezone: string): Date => {
  // Create a new Date object to avoid mutating the original date
  const utcDate = tzDate(date, timezone);

  // Return the UTC date
  return utcDate;
};

/**
 * @description This function checks if the user has some of the provided roles.
 * @author Damian
 * @date 08/07/2025
 * @export
 * @param {User} user
 * @param {string[]} roles
 * @returns {*}  {boolean}
 */
export function hasUserSomeRoles(user: User, roles: string[]): boolean {
  return user.roles.some((role) => roles.includes(role.alias));
}

/**
 * @description This function extracts all the unique IDs from an array of objects.
 * @author Damian
 * @date 11/07/2025
 * @export
 * @param {Record<string, string[]>[]} data
 * @returns {*}  {string[]}
 */
export function extractAllUniqueIds(
  data: Record<string, string[]>[],
): string[] {
  const idSet = new Set<string>();

  data.forEach((obj) => {
    for (const [parentId, children] of Object.entries(obj)) {
      idSet.add(parentId);
      children.forEach((childId) => idSet.add(childId));
    }
  });

  return Array.from(idSet);
}

export function extractUniqueCategoryIdsFromTopics(
  topics: TopicsWithParent[],
): Category['_id'][] {
  const idSet = new Set<Category['_id']>();

  for (const topic of topics) {
    idSet.add(topic.parent._id);

    for (const child of topic.childCategories) {
      idSet.add(child._id);
    }
  }

  return Array.from(idSet);
}

/**
 * @description This function checks if the user is an admin.
 * @author Damian
 * @date 25/07/2025
 * @export
 * @param {AppUser} appUser
 * @returns {*}  {boolean}
 */
export function isUserAdmin(appUser: AppUser): boolean {
  const { ADMINISTRATOR } = RolesEnum;
  return appUser.user.roles.some((role) => role.alias === ADMINISTRATOR);
}

/**
 * Interface to define filtering conditions
 */
export interface FilterCondition {
  key: string;
  value: any;
}

/**
 * Recursive function that filters objects based on specific conditions
 * @param obj - The object to evaluate
 * @param filterConditions - Array of filtering conditions
 * @returns true if the object should be excluded (contains a matching condition), false if it should be included
 */
export function shouldFilterObject(
  obj: any,
  filterConditions: FilterCondition[],
  visited = new Set<any>(),
): boolean {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return false;
  }

  // Si ya hemos visitado este objeto, evitar recursión infinita
  if (visited.has(obj)) {
    return false;
  }

  visited.add(obj);

  for (const [key, value] of Object.entries(obj)) {
    // Ignorar atributos undefined
    if (value === undefined) {
      continue;
    }

    const matchingCondition = filterConditions.find(
      (condition) => condition.key === key && condition.value === value,
    );

    if (matchingCondition) {
      return true;
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (shouldFilterObject(value, filterConditions, visited)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Function that filters an array of objects based on specified conditions.
 * @param objects - Array of objects to filter
 * @param filterConditions - Array of filtering conditions
 * @returns Array of objects that do NOT meet the filtering conditions
 */
export function filterObjects<T>(
  objects: T[],
  filterConditions: FilterCondition[],
): T[] {
  return objects.filter((obj) => !shouldFilterObject(obj, filterConditions));
}

/**
 * Function that verifies if a specific object should be included (not filtered).
 * @param obj - The object to evaluate
 * @param filterConditions - Array of filtering conditions
 * @returns true if the object should be included, false if it should be filtered
 */
export function shouldIncludeObject(
  obj: any,
  filterConditions: FilterCondition[],
): boolean {
  return !shouldFilterObject(obj, filterConditions);
}

/**
 * @description This function return the payload for the create information
 * @author Damian
 * @date 29/07/2025
 * @export
 * @param {Information} information
 * @param {string} language
 * @param {AppUser} [appUser]
 * @returns {*}  {CreateInformationDto}
 */
export function createInformationAsPayload(
  information: Information,
  language: string,
  appUser?: AppUser,
): CreateInformationDto {
  const { content } = information;
  return {
    author: appUser?._id || 'System',
    alias: normalizeString(information.alias),
    content: {
      language: language,
      title: (content.title as LanguageMapType).languageMap,
      subtitle: (content.subtitle as LanguageMapType).languageMap,
      body: (content.body as LanguageMapType).languageMap,
    },
  };
}

export function getAvailableModerationActions(
  currentModerationStatus: ModerationStatus,
): string[] {
  const {
    MODERATION_APPROVED,
    MODERATION_EMAIL_RESENT,
    MODERATION_PENDING,
    MODERATION_REJECTED,
    USER_ACTIVATED,
    USER_DEACTIVATED,
  } = ModerationStatusAliasEnum;

  const possibleAliases = {
    MODERATION_APPROVED: [USER_DEACTIVATED, USER_ACTIVATED],
    MODERATION_REJECTED: [],
    MODERATION_PENDING: [MODERATION_REJECTED, MODERATION_APPROVED],
    MODERATION_EMAIL_RESENT: [MODERATION_EMAIL_RESENT, USER_DEACTIVATED],
    USER_DEACTIVATED: [USER_ACTIVATED],
    USER_ACTIVATED: [USER_DEACTIVATED],
  };

  const actions = possibleAliases[currentModerationStatus.alias] || [];

  // Filtrar MODERATION_APPROVED si estuviera por error
  return actions
    .map((alias) => ModerationStatusAliasEnum[alias])
    .filter(Boolean); // en caso de alias inexistentes
}
