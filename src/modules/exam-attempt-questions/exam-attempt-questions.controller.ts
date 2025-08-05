import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExamAttemptQuestionsService } from './exam-attempt-questions.service';
import { CreateExamAttemptQuestionDto } from './dto/create-exam-attempt-question.dto';
import { UpdateExamAttemptQuestionDto } from './dto/update-exam-attempt-question.dto';

@Controller('exam-attempt-questions')
export class ExamAttemptQuestionsController {
  constructor(
    private readonly examAttemptQuestionsService: ExamAttemptQuestionsService,
  ) {}
}
