import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { HttpRequestModule } from '@/shared/http-request/http-request.module';

@Module({
  imports: [HttpRequestModule],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}
