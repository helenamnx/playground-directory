import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { HttpConfigModule } from "../http/http.module";
/**
 * @description Health module for health check of the application
 * @author Joel
 * @date 12/07/2024
 * @export
 * @class HealthModule
 * @tutorial https://docs.nestjs.com/recipes/terminus
 * @installation npm install --save @nestjs/terminus
 */

@Module({
  imports: [
    TerminusModule.forRoot({
      logger: true,
      errorLogStyle: "pretty",
      gracefulShutdownTimeoutMs: 1000,
    }),
    HttpConfigModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
