import { Module } from '@nestjs/common';
import { HttpConfigService } from './http-config.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
  ],
  exports: [HttpModule],
})
export class HttpConfigModule {}
