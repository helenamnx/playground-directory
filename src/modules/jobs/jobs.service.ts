import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { Job } from './schemas/job.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class JobsService extends CRUDService<Job> {
  constructor(@InjectModel(Job.name) private jobModel: Model<Job>) {
    super(jobModel);
  }
}
