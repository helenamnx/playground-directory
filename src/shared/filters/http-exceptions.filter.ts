import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { CustomErrorKeys } from '../enums/error-keys.enum';
import {
  CustomErrorResponse,
  ValidationCustomErrorResponse,
} from '../responses/error/custom-error-response.class';
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: Logger,
  ) {}
  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let responseBody: CustomErrorResponse;

    //TODO: Refactorize
    if (isControlledError(exception)) {
      this.logger.error(exception);

      responseBody = isValidationError(exception)
        ? new ValidationCustomErrorResponse({
            type: exception.type,
            title: exception.title,
            statusCode: exception.statusCode,
            detail: exception.detail,
            key: exception.key,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            validationErrors: exception.validationErrors,
          })
        : new CustomErrorResponse({
            type: exception.type,
            title: exception.title,
            statusCode: exception.statusCode,
            detail: exception.detail,
            key: exception.key,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
          });

      httpAdapter.reply(ctx.getResponse(), responseBody, exception.statusCode);
    } else if (isNotControlledError(exception)) {
      //get the stack from the unhandled exception
      const stack = exception.stack!;
      //get the name of the function from the stack
      const detailedError = `${exception.toString()} in ${this.getFunctionNameFromStack(stack)}`;
      this.logger.error(detailedError);

      responseBody = new CustomErrorResponse({
        type: '/server-error',
        title: 'Internal Server Error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        detail: detailedError,
        key: CustomErrorKeys.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
      });
      httpAdapter.reply(
        ctx.getResponse(),
        responseBody,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getFunctionNameFromStack(stack: string): string {
    // Split the stack trace into individual lines
    const stackLines = stack.split('\n');

    // Check if there are multiple lines in the stack trace
    if (stackLines.length > 1) {
      // Get the second line, which typically contains the function name
      const functionLine = stackLines[1];

      // Use a regular expression to match the function name in the format "at functionName ("
      const match = functionLine.match(/at (.*?) \(/);

      // If a match is found, return the extracted function name
      if (match) {
        return match[1];
      }
    }

    // If no function name is found, return "Unknown"
    return 'Unknown';
  }
}

export function isControlledError(
  exception: unknown,
): exception is CustomErrorResponse {
  return exception instanceof CustomErrorResponse;
}

export function isValidationError(
  exception: unknown,
): exception is ValidationCustomErrorResponse {
  return exception instanceof ValidationCustomErrorResponse;
}

export function isNotControlledError(exception: unknown): exception is Error {
  return exception instanceof Error;
}
