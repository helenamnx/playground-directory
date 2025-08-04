import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  private readonly baseUrl: string;
  private readonly appVersion: any;
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: MongooseHealthIndicator,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('http.BASE_URL');
    this.baseUrl = this.configService.get<string>('app.APP_VERSION');
  }

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.http.pingCheck(
          'basic-template',
          `${this.baseUrl}/${this.appVersion}`,
        ),
      () => this.db.pingCheck('database'),
    ]);
  }
}
