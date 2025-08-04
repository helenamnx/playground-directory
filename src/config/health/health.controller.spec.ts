import { Test, TestingModule } from "@nestjs/testing";
import { HealthController } from "./health.controller";
import {
  HealthCheckService,
  HttpHealthIndicator,
  MongooseHealthIndicator,
} from "@nestjs/terminus";

describe("HealthController", () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let httpHealthIndicator: HttpHealthIndicator;
  let mongooseHealthIndicator: MongooseHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthCheckService,
        HttpHealthIndicator,
        MongooseHealthIndicator,
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    httpHealthIndicator = module.get<HttpHealthIndicator>(HttpHealthIndicator);
    mongooseHealthIndicator = module.get<MongooseHealthIndicator>(
      MongooseHealthIndicator,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("check", () => {
    it("should return health check result", async () => {
      const result = await controller.check();

      expect(result).toEqual({
        fivolutionGastro: { status: "ok" },
        database: { status: "ok" },
      });
    });
  });
});
