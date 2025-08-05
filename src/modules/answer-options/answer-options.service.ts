import { Injectable } from '@nestjs/common';
import { CreateAnswerOptionDto } from './dto/create-answer-option.dto';
import { UpdateAnswerOptionDto } from './dto/update-answer-option.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { AnswerOption } from './schemas/answer-option.entity';
import { Model } from 'mongoose';
import { transform } from '@swc/core';
import { transformToLanguageMapType } from '@/shared/utils/utils';
@Injectable()
export class AnswerOptionsService extends CRUDService<AnswerOption> {
  constructor(
    @InjectModel(AnswerOption.name)
    private answerOptionsModel: Model<AnswerOption>,
  ) {
    super(answerOptionsModel);
  }

  async createAnswerOptions(createAnswerOptionDto: CreateAnswerOptionDto) {
    const { isCorrect, justification, value } = createAnswerOptionDto;
    const newAnswerOption = await super.create({
      isCorrect: isCorrect || false,
      justification: justification
        ? transformToLanguageMapType(justification)
        : null,
      value: transformToLanguageMapType(value),
    });
    return newAnswerOption;
  }

  async updateAnswerOptions(updateAnswerOptionDto: UpdateAnswerOptionDto) {
    const { _id } = updateAnswerOptionDto;
    const updatedAnswerOptions = await super.update(_id, updateAnswerOptionDto);
    return updatedAnswerOptions;
  }

  async findAllAnswerOptions() {
    const allAnswerOptions = await super.findAll({});
    return allAnswerOptions;
  }

  async findOneById(id: string) {
    const storedAnswerOptions = await super.findOne({
      filterOptions: {
        _id: id,
      },
    });
    return storedAnswerOptions;
  }
}
