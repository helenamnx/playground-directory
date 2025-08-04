// app.utils.ts
import { HttpStatus, Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import mongoose from 'mongoose';
import { ValidationCustomErrorResponse } from '../responses/error/custom-error-response.class';
import { CustomErrorKeys } from '../enums/error-keys.enum';

/**
 * @description Sets up global validation pipes for the application.
 * @author Helena Rodríguez
 * @date 13/03/2024
 * @export
 * @param {*} app - The application instance to which the global pipes will be applied.
 */
export function setupGlobalPipes(app: any) {
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const mapValidationErrors = (error: any) => {
          // If there are no children, simply return the error with detail and pointer
          if (!error.children || error.children.length === 0) {
            return {
              detail: error.constraints
                ? error.constraints[Object.keys(error.constraints)[0]] || ''
                : 'Unknown validation error',
              pointer: error.property,
            };
          }

          // If there are children, map the errors of the children
          const childErrors = error.children.flatMap((child: any) =>
            mapValidationErrors(child),
          );

          // If there are errors in the parent and also in the children, group them into a single object
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

        // Convert the array of errors into a flat array
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

/**
 * @description Enables request logging for debugging and monitoring.
 * @export
 */
export function setupRequestLogging() {
  mongoose.set('debug', (collectionName, methodName, ...methodArgs) => {
    Logger.log(
      `${collectionName}.${methodName}(${JSON.stringify(methodArgs)})`,
      'Mongoose',
    );
  });
}
