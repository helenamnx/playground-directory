import { Module } from '@nestjs/common';
import { HttpRequestService } from './http-request.service';
import { HttpConfigModule } from 'src/config/http/http.module';

@Module({
  imports: [HttpConfigModule],
  providers: [HttpRequestService],
  exports: [HttpRequestService],
})
export class HttpRequestModule {}
