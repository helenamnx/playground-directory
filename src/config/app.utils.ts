// app.utils.ts
import { HttpStatus, Logger, ValidationError } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { ValidationCustomErrorResponse } from '../shared/responses/error/custom-error-response.class';
import { CustomErrorKeys } from '../shared/enums/error-keys.enum';

/**
 * @description
 * @author Helena Rodríguez
 * @date 13/03/2024
 * @export
 * @param {*} app
 */

// Use a global validation pipe to validate incoming requests
//TODO: refactorize
export function setupGlobalPipes(app: any) {
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const mapValidationErrors = (error: any) => {
          // Si no tiene children, simplemente retorna el error con detail y pointer
          if (!error.children || error.children.length === 0) {
            return {
              detail: error.constraints
                ? error.constraints[Object.keys(error.constraints)[0]] || ''
                : 'Unknown validation error',
              pointer: error.property,
            };
          }

          // Si tiene children, mapea los errores de los children
          const childErrors = error.children.flatMap((child: any) =>
            mapValidationErrors(child),
          );

          // Si tiene errors en el padre y también en los children, los agrupamos en un solo objeto
          if (error.constraints) {
            return [
              {
                detail:
                  error.constraints[Object.keys(error.constraints)[0]] || '',
                pointer: error.property,
              },
              ...childErrors,
            ];
          }

          return childErrors.length > 0
            ? [{ [error.property]: childErrors }]
            : [];
        };

        // Convertir el array de errores en un array plano
        const result = errors.flatMap(mapValidationErrors);

        const errorResult = {
          type: '/validation-error',
          title: 'Your request is not valid',
          detail:
            'One or more fields have validation errors. Please check and try again.',
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          validationErrors: result,
          key: CustomErrorKeys.VALIDATION_ERROR,
          timestamp: new Date().toISOString(),
        };

        return new ValidationCustomErrorResponse(errorResult);
      },
      stopAtFirstError: true,
    }),
  );
}

// Use a global exception filter to handle exceptions and errors
// export function setupGlobalFilters(app: any) {
//   app.useGlobalFilters(new AllExceptionsFilter());
// }

// Enable request logging for debugging and monitoring
// export function setupRequestLogging() {
//   mongoose.set('debug', (collectionName, methodName, ...methodArgs) => {
//     Logger.log(
//       `${collectionName}.${methodName}(${JSON.stringify(methodArgs)})`,
//       'Mongoose',
//     );
//   });
// }
