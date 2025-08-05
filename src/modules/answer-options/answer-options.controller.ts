import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AnswerOptionsService } from './answer-options.service';
import { CreateAnswerOptionDto } from './dto/create-answer-option.dto';
import { UpdateAnswerOptionDto } from './dto/update-answer-option.dto';

@Controller('answer-options')
export class AnswerOptionsController {
  constructor(private readonly answerOptionsService: AnswerOptionsService) {}

  // @Post()
  // create(@Body() createAnswerOptionDto: CreateAnswerOptionDto) {
  //   return this.answerOptionsService.create(createAnswerOptionDto);
  // }
}
