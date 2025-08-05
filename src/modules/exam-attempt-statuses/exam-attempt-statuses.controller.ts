import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExamAttemptStatusesService } from './exam-attempt-statuses.service';
import { CreateExamAttemptStatusDto } from './dto/create-exam-attempt-status.dto';
import { UpdateExamAttemptStatusDto } from './dto/update-exam-attempt-status.dto';

@Controller('exam-attempt-statuses')
export class ExamAttemptStatusesController {
  constructor(
    private readonly examAttemptStatusesService: ExamAttemptStatusesService,
  ) {}
}
