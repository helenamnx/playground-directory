import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Method } from 'axios';
import { HttpRequestFactory } from './classes/http-request-factory.class';
import { HttpRequestMethods } from './interfaces/http-request-methods.interface';
import { RedisService } from '../services/redis/redis.service';

@Injectable()
export class HttpRequestService extends HttpRequestFactory {
  requestMethods: HttpRequestMethods;
  private readonly logger = new Logger(HttpRequestService.name);

  constructor(
    private readonly _httpService: HttpService,
    redisService: RedisService,
  ) {
    super(_httpService, redisService);
  }

  public getHttpRequestMethods() {
    this.requestMethods = {
      GET: this.setHttpRequestMethod('GET'),
      POST: this.setHttpRequestMethod('POST'),
      PUT: this.setHttpRequestMethod('PUT'),
      PATCH: this.setHttpRequestMethod('PATCH'),
      DELETE: this.setHttpRequestMethod('DELETE'),
    };
    return this.requestMethods;
  }

  private setHttpRequestMethod(method: Method) {
    try {
      const httpRequestMethod = this.createHttpRequest(method);
      return httpRequestMethod;
    } catch (error: any) {
      this.logger.error(error);
      throw new error(error);
    }
  }
}
