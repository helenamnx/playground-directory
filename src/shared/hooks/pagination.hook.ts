import { PaginationParamsDto } from 'src/config/database/CRUD/dto/pagination-params.dto';
import { fastifyInstance } from '../instances/fastify.instances';

export function paginationPreHook() {
  fastifyInstance.addHook('preHandler', doPagination());
}

export function testingPaginationPreHook(app: any) {
  app.getHttpAdapter().getInstance().addHook('preHandler', doPagination());
}
function doPagination() {
  return async (request: any, reply: any) => {
    const { page, limit, sort } = request.query as any;
    // Crea un objeto DTO de parámetros de paginación con valores por defecto si no se proporcionan
    const paginationParamsDto: PaginationParamsDto<any> = {
      // Convierte el parámetro currentPage a un número entero, por defecto 1
      currentPage: parseInt(page, 10) || 1,
      // Convierte el parámetro limit a un número entero, por defecto 10
      limit: parseInt(limit, 10) || 10,
      // Convierte el parámetro sortOptions a un objeto JSON, por defecto un objeto vacío
      sortOptions: sort ? JSON.parse(sort) : {},
    };

    // Asigna los parámetros de paginación a la solicitud para que puedan ser usados por el controlador
    (request as any).paginationParams = paginationParamsDto;
  };
}
