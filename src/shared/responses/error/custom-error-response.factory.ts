import { HttpStatus } from '@nestjs/common';

import { CustomErrorResponse } from './custom-error-response.class';

export const createCustomErrorResponseFactory = (
  statusCode: HttpStatus,
  type: string,
) => {
  const newCustomErrorClass = class extends CustomErrorResponse {
    constructor(
      errorResponse: Pick<CustomErrorResponse, 'title' | 'detail' | 'key'>,
    ) {
      const { title, detail, key } = errorResponse;
      super({
        statusCode: statusCode,
        type: type,
        title: title,
        detail: detail,
        key: key,
      });
    }
  };
  return newCustomErrorClass;
};
