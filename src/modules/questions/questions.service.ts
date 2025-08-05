import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { AnswerOptionsService } from '../answer-options/answer-options.service';
import { InformationService } from '../information/information.service';
import { Question } from './schemas/question.schema';
import { FilterQuery, Model, PopulateOptions } from 'mongoose';
import { CategoriesService } from '../categories/categories.service';
import { QuestionConfigurationsService } from '../question-configurations/question-configurations.service';
import { filterLanguageMap } from '@/shared/utils/filter-language-map.utils';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import { FilterBuilder } from '@/shared/utils/filter-builder.util';
import {
  createInformationAsPayload,
  normalizeString,
  transformToLanguageMapType,
} from '@/shared/utils/utils';
import { Category } from '../categories/schemas/category.schema';
import { PaginationParamsDto } from '@/config/database/CRUD/dto/pagination-params.dto';
import { AnswerOption } from '../answer-options/schemas/answer-option.entity';
import { AppUser } from '../app-users/schemas/app-user.schema';
import { UpdateExamVersionDto } from '../exams/dto/update-exam-version.dto';
import { UpdateQuestionVersionDto } from './dto/update-question-version.dto';
import { Exam } from '../exams/schemas/exam.schema';
import { LanguageMapType } from '@/shared/types/language-map.type';
import { CreateInformationDto } from '../information/dto/create-information.dto';

@Injectable()
export class QuestionsService extends CRUDService<Question> {
  constructor(
    @InjectModel(Question.name)
    private QuestionModel: Model<Question>,
    private readonly informationService: InformationService,
    private readonly answerOptionService: AnswerOptionsService,
    private readonly categoriesService: CategoriesService,
    private readonly questionConfigurationService: QuestionConfigurationsService,
  ) {
    super(QuestionModel);
  }
  async createQuestion(createQuestionDto: CreateQuestionDto) {
    const { answerOptions, information, topics, configuration, observations } =
      createQuestionDto;

    //check if the categories exists
    if (topics) {
      await Promise.all(
        topics.map(async (topicID) => {
          await this.categoriesService.findOneByID(topicID);
        }),
      );
    }
    //Create the answer options for the question
    const newAnswerOptionsIds = await Promise.all(
      answerOptions.map(async (option) => {
        const newOption = await this.answerOptionService.createAnswerOptions({
          ...option,
          value: option.value, // Convert LanguageMap to iterable format
        });
        return newOption._id;
      }),
    );
    //create the information
    const newInformation =
      await this.informationService.createInformation(information);

    //create the configuration
    const newQuestionConfiguration =
      await this.questionConfigurationService.createQuestionConfiguration(
        configuration,
      );

    // TODO: Create the question images

    //Creamos la question:

    const newQuestion = await super.create({
      ...createQuestionDto,
      information: newInformation._id,
      answerOptions: newAnswerOptionsIds,
      configuration: newQuestionConfiguration._id,
      observations: observations
        ? transformToLanguageMapType(createQuestionDto.observations)
        : null,
    });
    return newQuestion;
  }

  async findAllQuestions(params?: {
    filterOptions?: FilterQuery<Question>;
    paginationParams?: PaginationParamsDto<Question>;
    lang?: string;
  }) {
    let { filterOptions, paginationParams, lang } = params || {};

    const builder = new FilterBuilder({
      categoriesService: this.categoriesService,
      informationService: this.informationService,
    });
    const filterOptionsBuilder = await builder.build(filterOptions);
    let allQuestions = await super.findAll(
      {
        filterOptions: filterOptionsBuilder,
        selectOptions: ['externalId'],
        populateOptions: [
          'topics',
          'configuration',
          {
            path: 'information',
            populate: {
              path: 'content',
            },
          },
          {
            path: 'answerOptions',
          },
        ],
      },
      paginationParams,
    );

    if (lang) {
      return allQuestions.map((item) =>
        filterLanguageMap(item.toJSON(), lang),
      ) as Question[];
    }

    return allQuestions;
  }

  /**
   * @description This function returns a random set of questions from the topics provided.
   * @author Damian
   * @date 23/06/2025
   * @param {Category['_id'][]} topics
   * @param {number} limit
   * @param {Question['_id'][]} excludedIds
   * @returns {*}  {Promise<Question[]>}
   * @memberof QuestionsService
   */
  async getRandomQuestions(
    topics: Category['_id'][],
    limit: number,
    excludedIds: Question['_id'][],
    populateOptions?: any[],
  ): Promise<Question[]> {
    try {
      const pipeline: any[] = [];

      // 1. Condiciones de $match dinámicas
      const matchConditions: any = {};
      // Excluir IDs (opcional)
      if (excludedIds && excludedIds.length > 0) {
        matchConditions._id = { $nin: excludedIds };
      }
      // Incluir solo preguntas con alguno de los topics
      if (topics && topics.length > 0) {
        matchConditions.topics = { $in: topics };
      }

      // Agregar $match si hay condiciones
      if (Object.keys(matchConditions).length > 0) {
        pipeline.push({ $match: matchConditions });
      }

      // 2. Obtener una muestra aleatoria
      pipeline.push({
        $sample: { size: limit },
      });

      // 3. Ejecutar el pipeline de agregación
      let randomQuestions = await this.QuestionModel.aggregate(pipeline).exec();

      // 4. Aplicar populate si se especifica
      if (populateOptions?.length) {
        randomQuestions = await this.QuestionModel.populate(
          randomQuestions,
          populateOptions,
        );
      }

      return randomQuestions as Question[];
    } catch (error) {
      console.error('Error fetching random documents:', error);
      throw new Error('Could not retrieve random documents.');
    }
  }

  async findOneById(params: {
    id: string;
    lang?: string;
    populateOptions?: (PopulateOptions | keyof Question)[];
  }): Promise<Question> {
    try {
      const { id, lang, populateOptions } = params;
      const storedQuestion = await super.findOne({
        filterOptions: {
          _id: id,
        },
        populateOptions: populateOptions || [
          {
            path: 'information',
            populate: {
              path: 'content',
            },
          },
          {
            path: 'answerOptions',
          },
        ],
      });

      if (lang) {
        return filterLanguageMap(storedQuestion.toJSON(), lang) as Question;
      }
      return storedQuestion;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * @description This function returns a random set of questions from the provided topics.
   * @author Damian
   * @date 20/06/2025
   * @param {Category['_id'][]} topics
   * @param {number} limit
   * @returns {*}
   * @memberof QuestionsService
   */
  async getRandomQuestionsByTopics(
    topics: Category['_id'][],
    limit: number,
    excludeQuestions?: Question['_id'][],
  ) {
    //TODO: add a parameter to balance the number of questions per topic
    return await this.findAllQuestions({
      filterOptions: {
        topics: {
          $in: topics,
        },
        _id: {
          $nin: excludeQuestions,
        },
      },
      paginationParams: {
        limit: limit,
      },
    });
  }

  /**
   * @description This function returns the answer option with the provided ID.
   * @author Damian
   * @date 25/06/2025
   * @param {string} answerOptionId
   * @param {string} [lang]
   * @returns {*}
   * @memberof QuestionsService
   */
  async findAnswerOptionById(
    answerOptionId: AnswerOption['_id'],
    lang?: string,
  ): Promise<AnswerOption> {
    try {
      const storedAnswerOption =
        await this.answerOptionService.findOneById(answerOptionId);
      if (lang) {
        return filterLanguageMap(
          storedAnswerOption.toJSON(),
          lang,
        ) as AnswerOption;
      }
      return storedAnswerOption;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateQuestionVersion(
    updateQuestionVersionDto: UpdateQuestionVersionDto,
    language: string,
    appUser: AppUser,
  ) {
    try {
      //find the exam to check if it exists
      const lastExamVersion = await super.findOne({
        filterOptions: {
          _id: updateQuestionVersionDto._id,
        },
        populateOptions: [
          {
            path: 'information',
            populate: ['content'],
          },
          {
            path: 'topics',
          },
          {
            path: 'configuration',
          },
          { path: 'answerOptions' },
        ],
      });
      const payload = this.createQuestionPayload(
        updateQuestionVersionDto,
        lastExamVersion,
        language,
        appUser,
      );

      //create a new exam with the new version and the previous version
      const newExam = await this.createQuestion(payload);
      //return the new exam
      return newExam;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  private createQuestionPayload(
    dto: UpdateQuestionVersionDto,
    question: Question,
    language: string,
    appUser: AppUser,
  ) {
    const { information, answerOptions, topics, configuration, difficulty } =
      dto;
    return {
      difficulty: difficulty ?? question.difficulty,
      version: question.version + 1,
      previousQuestionVersion: question._id,
      answerOptions:
        answerOptions ??
        question.answerOptions.map((option) => {
          return {
            ...option,
            justification: option.justification?.languageMap,
            value: option.value.languageMap,
          };
        }),
      information:
        information ??
        createInformationAsPayload(question.information, language, appUser),
      topics: topics ?? question.topics.map((topic) => topic?._id),
      configuration: configuration ?? {
        ...question.configuration,
      },
    };
  }
}
