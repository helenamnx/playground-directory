import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  private readonly httpOptions: any;
  constructor(private readonly configService: ConfigService) {
    this.httpOptions = this.configService.get('http', {});
  }
  createHttpOptions(): HttpModuleOptions {
    const {
      TIMEOUT,
      MAX_REDIRECTS,
      // EXTERNAL_SERVICE_URL_BASE,
      // EXTERNAL_SERVICE_ALIAS,
    } = this.httpOptions;

    const axiosConfig: AxiosRequestConfig = {
      // baseURL: EXTERNAL_SERVICE_URL_BASE,
      timeout: TIMEOUT,
      maxRedirects: MAX_REDIRECTS,
      // headers: {
      //   'external-service': EXTERNAL_SERVICE_ALIAS,
      // },
    };

    return axiosConfig;
  }
}
