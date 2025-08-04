import { Test, TestingModule } from "@nestjs/testing";

import { IdempotencyKeysService } from "./idempotency-keys.service";

describe("IdempotencyKeysService", () => {
  let service: IdempotencyKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdempotencyKeysService],
    }).compile();

    service = module.get<IdempotencyKeysService>(IdempotencyKeysService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
