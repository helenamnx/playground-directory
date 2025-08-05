import { Injectable } from '@nestjs/common';
import { CreateExamAttemptStatusDto } from './dto/create-exam-attempt-status.dto';
import { UpdateExamAttemptStatusDto } from './dto/update-exam-attempt-status.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { ExamAttemptStatus } from './schema/exam-attempt-status.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StatusesService } from '../statuses/statuses.service';
@Injectable()
export class ExamAttemptStatusesService extends CRUDService<ExamAttemptStatus> {
  constructor(
    @InjectModel(ExamAttemptStatus.name)
    examAttemptStatusModel: Model<ExamAttemptStatus>,
    private readonly statusesService: StatusesService,
  ) {
    super(examAttemptStatusModel);
  }

  async createExamAttemptStatus(
    createExamAttemptStatusDto: CreateExamAttemptStatusDto,
  ) {
    try {
      const storedStatus = await this.statusesService.findOne({
        filterOptions: {
          value: createExamAttemptStatusDto.value,
        },
      });
      const newExamAttemptStatus = await super.create({
        ...createExamAttemptStatusDto,
        status: storedStatus._id,
      });
      return newExamAttemptStatus;
      //TODO: add history
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
