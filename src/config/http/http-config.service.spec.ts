import { Test, TestingModule } from "@nestjs/testing";
import { HttpConfigService } from "./http-config.service";
import { ConfigService } from "@nestjs/config";

describe("HttpConfigService", () => {
  let service: HttpConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpConfigService, ConfigService],
    }).compile();

    service = module.get<HttpConfigService>(HttpConfigService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
