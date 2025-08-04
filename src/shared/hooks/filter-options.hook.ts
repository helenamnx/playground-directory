import { fastifyInstance } from '../instances/fastify.instances';

export function filterOptionsPreHook() {
  fastifyInstance.addHook('preHandler', doFilterOptions());
}

export function testingFilterOptionsPreHook(app: any) {
  app.getHttpAdapter().getInstance().addHook('preHandler', doFilterOptions());
}

function doFilterOptions() {
  return async (request: any, reply: any) => {
    // Obtiene los parámetros de consulta (query params) del request
    const query = request.query as any;

    // Crea un objeto (Record) con los parámetros de consulta y sus valores,
    // excluyendo "page", "limit" y "sort"
    const filterOptions = Object.entries(query).reduce(
      (acc: any, [key, value]) => {
        // Si la clave no es "page", "limit" o "sort", añade al acumulador
        if (key !== 'page' && key !== 'limit' && key !== 'sort') {
          acc[key] = value;
        }

        return acc;
      },

      {},
    );
    // Asigna el objeto filterOptions al request
    (request as any).filterOptions = filterOptions ? filterOptions : {};
  };
}
