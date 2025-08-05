import { HttpStatus, Injectable } from '@nestjs/common';
import endpointActionsJSON from '@/shared/json/endpoint-actions.json';
import notFoundErrorsJSON from '@/shared/json/not-found-errors.json';
import conflictErrorsJSON from '@/shared/json/conflict-errors.json';
import badRequestErrorsJSON from '@/shared/json/bad-request-errors.json';
import unauthorizedErrorsJSON from '@/shared/json/unauthorized-errors.json';
import externalIdKeysJSON from '@/shared/json/external-id-keys.json';
import legalContactPointsJSON from '@/shared/json/legal-contact-points.json';
import legalContactPointsDevJSON from '@/shared/json/legal-contact-points.dev.json';
import { ErrorMap } from '@/shared/types/errors.types';
import { ConfigService } from '@nestjs/config';
import { NodeEnvEnum } from '@/shared/enums/node-env.enum';

@Injectable()
export class JsonFetcherService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * @description This function fetches the endpoint actions from the json file.
   * @author Damian
   * @date 12/06/2025
   * @returns {*}
   * @memberof JsonFetcherService
   */
  fetchEndpointActions() {
    return endpointActionsJSON;
  }

  fetchExternalIdKeys() {
    return externalIdKeysJSON;
  }

  /**
   * @description This function fetches the errors from the json file.
   * @author Damian
   * @date 12/06/2025
   * @param {HttpStatus[]} statusCodes
   * @returns An object with the errors
   * @memberof JsonFetcherService
   */
  fetchErrors<T extends (keyof ErrorMap)[]>(
    statusCodes: T,
  ): { [K in T[number]]: ErrorMap[K] } {
    const errors: Partial<{ [K in keyof ErrorMap]: ErrorMap[K] }> = {};

    statusCodes.forEach((statusCode) => {
      switch (statusCode) {
        case HttpStatus.NOT_FOUND:
          errors[statusCode] = notFoundErrorsJSON as ErrorMap[404];
          break;
        case HttpStatus.CONFLICT:
          errors[statusCode] = conflictErrorsJSON as ErrorMap[409];
          break;
        case HttpStatus.BAD_REQUEST:
          errors[statusCode] = badRequestErrorsJSON as ErrorMap[400];
          break;

        case HttpStatus.UNAUTHORIZED:
          errors[statusCode] = unauthorizedErrorsJSON as ErrorMap[401];
          break;
      }
    });

    return errors as { [K in T[number]]: ErrorMap[K] };
  }

  fetchLegalContactPoints() {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    return nodeEnv === NodeEnvEnum.DEVELOPMENT
      ? legalContactPointsDevJSON
      : legalContactPointsJSON;
  }
}
