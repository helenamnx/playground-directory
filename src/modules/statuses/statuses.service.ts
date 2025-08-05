import { Injectable } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { Status } from './schemas/status.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class StatusesService extends CRUDService<Status> {
  constructor(
    @InjectModel(Status.name) private readonly statusModel: Model<Status>,
  ) {
    super(statusModel);
  }
}
