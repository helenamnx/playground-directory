import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LocalitiesService } from './localities.service';
import { CreateLocalityDto } from './dto/create-locality.dto';
import { UpdateLocalityDto } from './dto/update-locality.dto';

@Controller('localities')
export class LocalitiesController {
  constructor(private readonly localitiesService: LocalitiesService) {}
}
