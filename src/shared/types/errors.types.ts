import { HttpStatus } from '@nestjs/common';
import { CustomErrorResponse } from '../responses/error/custom-error-response.class';

// Mapea de posibles errores por status code
export type ErrorMap = {
  [HttpStatus.NOT_FOUND]: Record<
    string,
    Pick<CustomErrorResponse, 'title' | 'detail' | 'key'>
  >;
  [HttpStatus.CONFLICT]: Record<
    string,
    Pick<CustomErrorResponse, 'title' | 'detail' | 'key'>
  >;
  [HttpStatus.BAD_REQUEST]: Record<
    string,
    Pick<CustomErrorResponse, 'title' | 'detail' | 'key'>
  >;

  [HttpStatus.UNAUTHORIZED]: Record<
    string,
    Pick<CustomErrorResponse, 'title' | 'detail' | 'key'>
  >;
};
