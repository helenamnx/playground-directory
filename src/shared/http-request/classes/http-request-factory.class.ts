import { AxiosRequestConfig, Method } from 'axios';
import { HttpService } from '@nestjs/axios';
import { HttpRequestParams } from '../interfaces/http-request-params.interface';
import { RedisService } from '../../services/redis/redis.service';

export abstract class HttpRequestFactory {
  protected readonly httpService: HttpService;
  protected readonly redisService: RedisService;
  constructor(httpService: HttpService, redisService: RedisService) {
    this.httpService = httpService;
    this.redisService = redisService;
  }
  public createHttpRequest(method: Method) {
    return async (params: HttpRequestParams) => {
      const { triggerError = true } = params;
      try {
        const config = await this.createAxiosRequestConfig(params, method);
        const response = await this.httpService.axiosRef.request(config);
        return response.data.object || response;
      } catch (error: any) {
        if (error.response.data) {
          console.log(error.response.data);
        } else {
          console.log(error);
        }
        if (triggerError) {
          console.log(
            '🚀 ~ HttpRequestService ~ setHttpRequestMethod ~ error:',
            error.response.data,
          );
          throw error;
        }
        throw error;
      }
    };
  }

  private async createAxiosRequestConfig(
    params: HttpRequestParams,
    method: Method,
  ): Promise<AxiosRequestConfig> {
    let { endpoint, data, headers } = params;
    const ownPlatformToken: any =
      await this.redisService.get('own-platform-token');
    if (ownPlatformToken) {
      headers = {
        ...headers,
        'client-token': `Bearer ${ownPlatformToken.access_token}`,
      };
    }
    const config: AxiosRequestConfig = {
      url: endpoint,
      method: method,
      headers: headers,
      data: data,
    };
    return config;
  }
}
