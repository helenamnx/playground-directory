import { PaginationParamsDto } from 'src/config/database/CRUD/dto/pagination-params.dto';

/**
 * @description This function returns the pagination params from the request query params.
 * @export
 * @param {*} request
 * @returns {*}
 */
export function doPagination(request: any) {
  const { page, limit, sort } = request.query;
  if (limit === 'all')
    return {
      limit: Infinity,
    };
  // Crea un objeto DTO de parámetros de paginación con valores por defecto si no se proporcionan
  const paginationParamsDto: PaginationParamsDto<any> = {
    // Convierte el parámetro currentPage a un número entero, por defecto 1
    currentPage: parseInt(page, 10) || 1,
    // Convierte el parámetro limit a un número entero, por defecto 10
    limit: parseInt(limit, 10) || 10,
    // Convierte el parámetro sortOptions a un objeto JSON, por defecto un objeto vacío
    sortOptions: sort ? JSON.parse(sort) : {},
  };
  return paginationParamsDto;
}
