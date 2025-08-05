import { PaginationKeysEnum } from '../enums/query.enum';

/**
 * @description This function returns the filter options from the request query params.
 * @export
 * @param {*} request
 * @returns {*}
 */
export function doFilterOptions(request: any) {
  // Obtiene los parámetros de consulta (query params) del request
  const query = request.query;

  // Crea un objeto (Record) con los parámetros de consulta y sus valores,
  // excluyendo "page", "limit" y "sort"
  const filterOptions = Object.entries(query).reduce(
    (acc: any, [key, value]) => {
      // Si la clave no es "page", "limit" o "sort", añade al acumulador
      if (
        key !== PaginationKeysEnum.PAGE &&
        key !== PaginationKeysEnum.LIMIT &&
        key !== PaginationKeysEnum.SORT
      ) {
        acc[key] = value;
      }

      return acc;
    },

    {},
  );
  return filterOptions ? filterOptions : {};
}
