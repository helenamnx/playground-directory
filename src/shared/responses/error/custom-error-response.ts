import { HttpStatus } from '@nestjs/common';

import { createCustomErrorResponseFactory } from './custom-error-response.factory';

export const NotFoundCustomResponse = createCustomErrorResponseFactory(
  HttpStatus.NOT_FOUND,
  '/not-found',
);

export const BadRequestCustomResponse = createCustomErrorResponseFactory(
  HttpStatus.BAD_REQUEST,
  '/bad-request',
);

export const UnauthorizedCustomResponse = createCustomErrorResponseFactory(
  HttpStatus.FORBIDDEN,
  '/unauthorized',
);

export const ConflictCustomResponse = createCustomErrorResponseFactory(
  HttpStatus.CONFLICT,
  '/conflict',
);
