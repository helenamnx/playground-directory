import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { EntitiesService } from './entities.service';

//TODO: Change the endpoint
@Controller('entities')
export class AccountTransactionsController {
  constructor(private readonly entitiesService: EntitiesService) {}
}
