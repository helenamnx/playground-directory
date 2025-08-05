import { Test, TestingModule } from '@nestjs/testing';
import { ContactPointsController } from './contact-points.controller';
import { ContactPointsService } from './contact-points.service';

describe('ContactPointsController', () => {
  let controller: ContactPointsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactPointsController],
      providers: [ContactPointsService],
    }).compile();

    controller = module.get<ContactPointsController>(ContactPointsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
