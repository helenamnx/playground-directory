import { Injectable } from '@nestjs/common';
import { CreateQuestionConfigurationDto } from './dto/create-question-configuration.dto';
import { UpdateQuestionConfigurationDto } from './dto/update-question-configuration.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { QuestionConfiguration } from './schemas/question-configuration.schema';
import { Model } from 'mongoose';

@Injectable()
export class QuestionConfigurationsService extends CRUDService<QuestionConfiguration> {
  constructor(
    @InjectModel(QuestionConfiguration.name)
    private questionConfigurationModel: Model<QuestionConfiguration>,
  ) {
    super(questionConfigurationModel);
  }
  async createQuestionConfiguration(
    createQuestionConfigurationDto: CreateQuestionConfigurationDto,
  ) {
    const newQuestionConfiguration = await super.create(
      createQuestionConfigurationDto,
    );
    return newQuestionConfiguration;
  }

  async updateQuestionConfiguration(
    updateQuestionConfigurationDto: UpdateQuestionConfigurationDto,
  ) {
    const { _id } = updateQuestionConfigurationDto;
    const updatedQuestion = await super.update(
      _id,
      updateQuestionConfigurationDto,
    );
    return updatedQuestion;
  }

  async findAllQuestionConfiguration() {
    const allQuestionConfiguration = await super.findAll({});
    return allQuestionConfiguration;
  }

  async findOneById(id: string) {
    const storedQuestionConfiguration = await super.findOne({
      filterOptions: {
        _id: id,
      },
    });
    return storedQuestionConfiguration;
  }
}
