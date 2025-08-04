import { Module } from '@nestjs/common';
import { SecurityCodesService } from './security-codes.service';
import { SecurityCodesController } from './security-codes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SecurityCode,
  SecurityCodeSchema,
} from './schemas/security-code.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SecurityCode.name,
        schema: SecurityCodeSchema,
      },
    ]),
  ],
  controllers: [SecurityCodesController],
  providers: [SecurityCodesService],
  exports: [SecurityCodesService],
})
export class SecurityCodesModule {}
