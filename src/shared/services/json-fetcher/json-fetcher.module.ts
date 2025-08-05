import { Global, Module } from '@nestjs/common';
import { JsonFetcherService } from './json-fetcher.service';

@Global()
@Module({
  providers: [JsonFetcherService],
  exports: [JsonFetcherService],
})
export class JsonFetcherModule {}
