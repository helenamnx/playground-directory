import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CustomErrorKeys } from '../enums/error-keys.enum';
import { BadRequestCustomResponse } from '../responses/error/custom-error-response';
import { IdempotencyKeysService } from 'src/idempotency-keys/idempotency-keys.service';
import { isValidUUID } from '../utils/check-uuid';

@Injectable()
export class IdempotencyKeyInterceptor implements NestInterceptor {
  constructor(private readonly idempotenceKeyService: IdempotencyKeysService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const request: any = ctx.getRequest<Request>();
    const idempotencyKey = request.headers['idempotence-key'];
    if (!idempotencyKey) {
      throw new BadRequestCustomResponse({
        title: 'Idempotence key required',
        key: CustomErrorKeys.IDEMPOTENCY_KEY_MISSING,
        detail:
          "The request does not contain a valid 'idempotence-key' header. " +
          'Please make sure the header is included and correctly formatted as a UUID.',
      });
    }

    if (!isValidUUID(idempotencyKey)) {
      throw new BadRequestCustomResponse({
        title: 'Invalid idempotency key',
        key: CustomErrorKeys.INVALID_IDEMPOTENCY_KEY,
        detail:
          "The 'idempotence-key' header in the request is not a valid UUID. " +
          'Please make sure the header is correctly formatted as a UUID.',
      });
    }

    //find if idempotency key is already stored
    const idempotencyStorage =
      await this.idempotenceKeyService.find(idempotencyKey);
    if (idempotencyStorage) {
      // if idempotency key is found and response is available, return it immediately
      if (this.idempotencyKeyHasResponse(idempotencyStorage)) {
        return of(idempotencyStorage.response);
      } else {
        // if idempotency key is in progress, return error
        throw new BadRequestCustomResponse({
          title: 'Idempotence key is in use',
          key: CustomErrorKeys.IDEMPOTENCY_KEY_IN_PROGRESS,
          detail:
            'A request with the same idempotence key is currently being processed. ' +
            'Please wait for it to complete.',
        });
      }
    }

    // pre save the idempotency key
    await this.idempotenceKeyService.preSave(idempotencyKey);
    return next.handle().pipe(
      tap(async (data) => {
        // update idempotency key with response
        await this.idempotenceKeyService.update(idempotencyKey, data);
        return data;
      }),
    );
  }

  private idempotencyKeyHasResponse = (idempotencyStorage: {
    key: string;
    response: any;
  }): boolean => {
    return idempotencyStorage.response ? true : false;
  };
}
