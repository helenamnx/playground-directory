import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { Model } from 'mongoose';
import { Exam } from './schemas/exam.schema';
import { InjectModel } from '@nestjs/mongoose';
import { InformationService } from '../information/information.service';
import { QuestionsService } from '../questions/questions.service';
import { ExamConfigurationsService } from '../exam-configurations/exam-configurations.service';
import { CategoriesService } from '../categories/categories.service';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import {
  filterLanguageMap,
  newFilterLanguageMap,
} from '@/shared/utils/filter-language-map.utils';
import { BadRequestCustomResponse } from '@/shared/responses/error/custom-error-response';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { ExamTypesEnum } from '@/shared/enums/exam-types.enum';
import { Question } from '../questions/schemas/question.schema';
import {
  clearArrayDuplicates,
  createInformationAsPayload,
  extractAllUniqueIds,
  extractUniqueCategoryIdsFromTopics,
  mergeAttributes,
  normalizeString,
} from '@/shared/utils/utils';
import { ExamTypesService } from '../exam-types/exam-types.service';
import { Category } from '../categories/schemas/category.schema';
import { ExamType } from '../exam-types/schemas/exam-type.schema';
import { HistoryService } from '../history/history.service';
import { LanguagesEnum } from '@/shared/enums/languages.enum';
import { TopicsWithParent } from './interfaces/exam.interface';
import { CreateInformationDto } from '../information/dto/create-information.dto';
import { KeyValue } from '@/shared/schemas/key-value.schema';
import examInformationJson from '@/modules/exams/json/exam-information.json';
import { UpdateInformationDto } from '../information/dto/update-information.dto';
import { UpdateExamVersionDto } from './dto/update-exam-version.dto';
import { LanguageMapType } from '@/shared/types/language-map.type';
import { AppUser } from '../app-users/schemas/app-user.schema';
import { CreateExamConfigurationDto } from '../exam-configurations/dto/create-exam-configuration.dto';
import { getExamQuestionsPopulate } from './populates/get-exam-questions.populate';
import { ExamAttempt } from '../exam-attempts/schemas/exam-attempt.schema';
@Injectable()
export class ExamsService extends CRUDService<Exam> {
  constructor(
    @InjectModel(Exam.name) private readonly examModel: Model<Exam>,
    private readonly informationService: InformationService,
    private readonly questionsService: QuestionsService,
    private readonly examConfigurationService: ExamConfigurationsService,
    private readonly categoriesService: CategoriesService,
    private readonly examTypesService: ExamTypesService,
    private readonly historyService: HistoryService,
    @InjectModel(ExamAttempt.name)
    private readonly examAttemptModel: Model<ExamAttempt>,
  ) {
    super(examModel);
  }

  /**
   * @description This function creates a new exam in the database.
   * @author Damian
   * @date 17/06/2025
   * @param {CreateExamDto} createExamDto
   * @returns {*}
   * @memberof ExamsService
   */
  async createExam(
    createExamDto: CreateExamDto,
    autoFillQuestions: boolean = true,
  ) {
    try {
      const {
        information,
        questions: questionsFromDto,
        topics,
        examType,
        configuration,
      } = createExamDto;
      //checkExamType
      const storedExamType = await this.examTypesService.findOne({
        filterOptions: {
          _id: examType,
        },
        populateOptions: ['configuration'], //TODO: do not use magic strings
      });

      //check topics
      const examTypeConfiguration = storedExamType.configuration;

      const maxTopics = configuration?.maxTopics
        ? configuration?.maxTopics
        : examTypeConfiguration.maxTopics || null;
      //check dto with the exam type
      await this.checkCreateExamDtoWithExamType(
        createExamDto,
        storedExamType,
        topics,
        maxTopics,
      );
      const applicableTopics = clearArrayDuplicates(
        await this.checkTopics(topics, questionsFromDto, maxTopics),
      );
      //check again the topics after the applicableTopics
      await this.checkCreateExamDtoWithExamType(
        createExamDto,
        storedExamType,
        applicableTopics.map((topic) => topic._id),
        maxTopics,
      );

      //checkQuestions and fill the questions if needed
      let questions: Question['_id'][] = [];
      if (autoFillQuestions) {
        const filledQuestions = await this.checkQuestions({
          questions: questions,
          numberOfQuestions:
            configuration?.numberOfQuestions ||
            storedExamType.configuration.numberOfQuestions, //if the numberOfQuestions is not provided, use the default value from the examType
          topics: applicableTopics.map((category) => category._id),
        });
        questions = filledQuestions.map((question) => question._id);
      }

      //merge the configuration with the default configuration
      const mergedConfiguration = mergeAttributes(
        configuration || {},
        storedExamType.configuration.toObject(),
      );
      //create the configuration
      const newExamConfiguration =
        await this.examConfigurationService.createExamConfiguration(
          mergedConfiguration,
        );

      //create information
      const newInformation =
        await this.informationService.createInformation(information);

      const newExam = await super.create({
        ...createExamDto,
        questions: questions,
        information: newInformation._id,
        configuration: newExamConfiguration._id,
        topics: applicableTopics.map((category) => category._id),
      });
      // this.historyService.createHistory({
      //   entity: newExam,
      // });
      return newExam;
    } catch (error) {
      throw error;
    }
  }

  async updateExam(updateExamDto: UpdateExamDto) {
    try {
      const { information, questions, topics, examType, configuration } =
        updateExamDto;
      //first find the exam, to update
      const storedExam = await this.findOneById(updateExamDto._id);

      //then, update the exam
      if (configuration) {
        await this.examConfigurationService.updateExamConfiguration({
          ...configuration,
          _id: storedExam.configuration._id,
        } as UpdateExamDto);
      }
      if (information) {
        await this.informationService.updateInformation(
          {
            ...information,
            _id: storedExam.information._id,
          } as UpdateInformationDto,
          LanguagesEnum.ES, //TODO: recoger del cliente
        );
      }
      //TODO: update the questions, topics and examType
      return storedExam;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async updateExamVersion(
    updateExamVersionDto: UpdateExamVersionDto,
    language: string,
    appUser: AppUser,
  ) {
    try {
      //find the exam to check if it exists
      const lastExamVersion = await this.findOneById(updateExamVersionDto._id);

      //if the update version is true, create a new exam with the new version and the previous version
      const payload = this.createExamPayload(
        updateExamVersionDto,
        lastExamVersion,
        language,
        appUser,
      );

      //create a new exam with the new version and the previous version
      const newExam = await this.createExam(payload, false);
      //return the new exam
      return newExam;

      //check if the exam already has attempts, if so, return a message
      //else, update the exam
      // if (someExamAttempts) {
      //   return { message: 'El examen ya tiene intentos.', hasAttempts: true };
      // } else {
      //   await this.updateExam(updateExamVersionDto);
      // }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async checkIfExamHasAttempts(id: string) {
    const someExamAttempt = await this.examAttemptModel.findOne({
      exam: id,
    });

    return someExamAttempt ? true : false;
  }

  /**
   * @description This function creates a new exam payload from the update exam version dto.
   * @author Damian
   * @date 29/07/2025
   * @private
   * @param {UpdateExamVersionDto} dto
   * @param {Exam} exam
   * @param {string} language
   * @param {AppUser} appUser
   * @returns {*}
   * @memberof ExamsService
   */
  private createExamPayload(
    dto: UpdateExamVersionDto,
    exam: Exam,
    language: string,
    appUser: AppUser,
  ) {
    const { information, questions, examType, topics, configuration } = dto;
    return {
      version: exam.version + 1,
      previousExamVersion: exam._id,
      information:
        information ??
        createInformationAsPayload(exam.information, language, appUser),
      questions: questions ?? exam.questions.map((question) => question?._id),
      topics: topics ?? exam.topics.map((topic) => topic?._id),
      examType: examType ?? exam.examType._id,
      configuration: configuration ?? {
        ...exam.configuration,
        groups: exam.configuration.groups.map((group) => group?._id),
      },
    };
  }

  /**
   * @description This function updates an existing exam in the database.
   * @author Damian
   * @date 17/06/2025
   * @returns {*}
   * @memberof ExamsService
   */
  async findAllExams(params: {
    filterOptions?: any;
    paginationParams?: any;
    lang?: string;
  }) {
    const { filterOptions, paginationParams, lang } = params || {};
    const allExams = await super.findAll(
      {
        populateOptions: [
          {
            path: 'configuration',
            populate: 'groups',
          },
          { path: 'information', populate: 'content' },
          'topics',
          'examType',
        ],
        selectOptions: ['-questions'],
      },
      paginationParams,
    );

    if (lang) {
      return allExams.map((item) => filterLanguageMap(item.toJSON(), lang));
    }

    return allExams;
  }

  /**
   * @description This function finds a single exam by its ID.
   * @author Damian
   * @date 17/06/2025
   * @param {string} id
   * @returns {*}
   * @memberof ExamsService
   */
  async findOneById(id: string, lang?: string) {
    const storedExam = await super.findOne({
      filterOptions: {
        _id: id,
      },
      populateOptions: [
        { path: 'configuration', populate: 'allowedRoles' },
        { path: 'information', populate: 'content' },
        'questions',
        'topics',
        'examType',
      ],
    });

    if (lang) {
      return filterLanguageMap(storedExam.toJSON(), lang) as Exam;
    }
    return storedExam;
  }

  async getExamQuestions(params: {
    id: string;
    lang?: string;
    availableQuestions?: boolean;
  }) {
    const { id, lang, availableQuestions } = params;
    const storedExam = await super.findOne({
      filterOptions: {
        _id: id,
      },
      //TODO: traer de un json
      populateOptions: [
        { path: 'topics' },
        {
          path: 'questions',
          populate: getExamQuestionsPopulate,
          select: ['-history'],
        },
      ],
    });
    let questions = storedExam.questions;

    if (availableQuestions) {
      questions = await this.questionsService.getRandomQuestions(
        storedExam.topics.map((topic) => topic._id),
        Infinity,
        questions.map((question) => question._id),
        getExamQuestionsPopulate,
      );

      if (lang) {
        //Json parse and stringify is used to convert the object to a string and back to an object to clear mongo properties
        return newFilterLanguageMap(
          JSON.parse(JSON.stringify(questions)),
          lang,
        );
      }

      return questions;
    }

    if (lang) {
      return filterLanguageMap(
        questions.map((question) => question.toObject()),
        lang,
      );
    }
    return questions;
  }

  /**
   * @description This function checks if the exam type is valid.
   * @author Damian
   * @date 20/06/2025
   * @private
   * @param {string} examType
   * @returns {*}  {boolean}
   * @memberof ExamsService
   */
  private isExamTypeValid(examType: string) {
    const { TEST_10, SIMULACRUM, EXAM_REPASO } = ExamTypesEnum;
    if (
      examType === TEST_10 ||
      examType === SIMULACRUM ||
      examType === EXAM_REPASO
    ) {
      return true;
    }
    return false;
  }

  // private async checkExamPayloadByType(
  //   createExamDto: CreateExamDto,
  //   examType: ExamTypesEnum,
  //   questions: Question[],
  // ) {
  //   const { TEST_10, SIMULACRUM, EXAM_REPASO } = ExamTypesEnum;
  //   const examTypes = [TEST_10, SIMULACRUM, EXAM_REPASO];
  //   if (!examTypes.includes(examType)) {
  //     throw new BadRequestCustomResponse({
  //       title: 'Invalid exam type',
  //       key: CustomErrorKeys.INVALID_EXAM_TYPE,
  //       detail: 'Invalid exam type',
  //     });
  //   }
  //   const { configuration } = createExamDto;
  //   switch (examType) {
  //     case TEST_10:
  //       //TODO: si el examen es test 10, las preguntas tienen que tener la misma categoría
  //       //check if there is no repeated question
  //       const questionsIds = questions.map((question) => question._id);
  //       if (hasArrayDuplicatedItems(questionsIds)) {
  //         throw new BadRequestCustomResponse({
  //           title: 'Questions must be unique',
  //           key: CustomErrorKeys.QUESTIONS_MUST_BE_UNIQUE,
  //           detail: 'Questions must be unique',
  //         });
  //       }
  //       //check if the categories of the questions are the same
  //       const categories = questions.map((question) => question.categories[0]);
  //       if (categories.every((category) => category === categories[0])) {
  //         //check if there are the minimum number of questions
  //         //if is least questions, add questions from the same type
  //         if (questions.length < configuration.minNumberOfQuestions) {
  //         }
  //       } else {
  //         throw new BadRequestCustomResponse({
  //           title: 'Categories must be the same',
  //           key: CustomErrorKeys.CATEGORIES_MUST_BE_SAME,
  //           detail: 'The questions must have the same categories',
  //         });
  //       }
  //       break;

  //     default:
  //       throw new BadRequestCustomResponse({
  //         title: 'Invalid exam type',
  //         key: CustomErrorKeys.INVALID_EXAM_TYPE,
  //         detail: 'Invalid exam type',
  //       });
  //       break;
  //   }
  // }

  /**
   * @description This function checks if the topics provided are valid.
   * If the topics array is empty, it returns all the topics.
   * If the topics array is not empty, it returns all the categories from the questions provided.
   * @author Damian
   * @date 20/06/2025
   * @private
   * @param {Category['_id'][]} topics
   * @param {Question['_id'][]} questions
   * @param {number} maxTopics
   * @returns {*}  {Promise<Category[]>}
   * @memberof ExamsService
   */
  private async checkTopics(
    topics: Category['_id'][],
    questions: Question['_id'][],
    maxTopics?: number,
  ): Promise<Category[]> {
    //if there is no topic
    if (topics.length <= 0) {
      //and no questions, return all the topics
      //if there are maxTopics, filter the limit with the maxTopics
      //else, return all the topics
      if (questions.length <= 0) {
        const storedTopics = await this.categoriesService.findAllCategories({
          paginationParams: {
            limit: maxTopics ? maxTopics : Infinity,
          },
        });
        return storedTopics;
      } else {
        //if there are no topics, but there are questions, return the topics from the questions
        const storedQuestions = await Promise.all(
          questions.map(async (questionId) => {
            const storedQuestion = await this.questionsService.findOneById({
              id: questionId,
              populateOptions: [
                {
                  path: 'topics',
                },
              ],
            });
            return storedQuestion;
          }),
        );
        //map all the categories from all the questions
        const topicsFromQuestions = storedQuestions.map(
          (question) => question.topics,
        );
        //flatten the categories from questions, because is an array of arrays
        const topicsFromQuestionsFlatten = topicsFromQuestions.flat();

        //get all the unique categories from the questions
        const uniqueTopics = Array.from(new Set(topicsFromQuestionsFlatten));

        return uniqueTopics;
        //if there are topics and no questions, return the topics from database
      }
    } else {
      //TODO: get the maxTopics from the configuration
      const storedTopics = await Promise.all(
        topics.map(async (topicId) => {
          const storedTopic = await this.categoriesService.findOneByID(topicId);
          return storedTopic;
        }),
      );
      return storedTopics;
    }
  }

  /**
   * @description
   * @author Damian
   * @date 20/06/2025
   * @private
   * @param {{
   *     questions: Question['_id'][];
   *     numberOfQuestions: number;
   *     topics: Category['_id'][];
   *   }} params
   * @returns {*}  {Promise<Question[]>}
   * @memberof ExamsService
   */
  private async checkQuestions(params: {
    questions: Question['_id'][];
    numberOfQuestions: number;
    topics: Category['_id'][];
  }): Promise<Question[]> {
    const { questions, numberOfQuestions, topics } = params;
    //first get all the questions provided and clear the duplicated ones
    let clearedQuestions = clearArrayDuplicates(questions);
    //if the questions array is not the same as the cleared questions, throw an error
    if (questions.length !== clearedQuestions.length) {
      throw new BadRequestCustomResponse({
        title: 'Questions must be unique',
        key: CustomErrorKeys.QUESTIONS_MUST_BE_UNIQUE,
        detail: 'Questions must be unique',
      });
    }
    //find the questions
    const storedQuestions =
      (await Promise.all(
        clearedQuestions.map(async (questionId) => {
          const storedQuestion = await this.questionsService.findOneById({
            id: questionId,
          });
          return storedQuestion;
        }),
      )) || [];

    //if there are topics, check if the questions have some topic, if not, return error
    if (topics.length > 0) {
      storedQuestions.forEach((question: any) => {
        if (!topics.some((topic) => question.topics.includes(topic))) {
          throw new BadRequestCustomResponse({
            title: 'Questions must have the same topics',
            key: CustomErrorKeys.QUESTIONS_MUST_HAVE_SAME_TOPICS,
            detail: 'Questions must have the same topics',
          });
        }
      });
    }

    //fill the other questions if the array of questions are less than the numberOfQuestions from the configuration
    if (storedQuestions.length < numberOfQuestions) {
      const randomQuestions = await this.questionsService.getRandomQuestions(
        topics,
        numberOfQuestions - clearedQuestions.length,
        storedQuestions.map((question) => question._id),
      );
      const result = [...storedQuestions, ...randomQuestions];
      //if the result array has not the same length as the numberOfQuestions, throw an error
      //because it inferred that the topics does not have that number of questions
      if (result.length !== numberOfQuestions) {
        throw new BadRequestCustomResponse({
          title: 'Topics cannot fill the number of questions',
          key: CustomErrorKeys.TOPICS_CANT_FILL_QUESTIONS,
          detail: 'Topics cannot fill the number of questions',
        });
      }
      return result;
    }

    return storedQuestions;
  }

  private async checkCreateExamDtoWithExamType(
    createExamDto: CreateExamDto,
    examType: ExamType,
    topics: Category['_id'][],
    maxTopics: number,
  ) {
    try {
      const { configuration } = examType;
      const { passingScore, maxScore } = configuration;
      //check if the topics exceed the maxTopics
      const topicsOfTheExam = await this.getTopicsToGenerateExam(topics);
      this.checkMaxTopics(
        maxTopics,
        topicsOfTheExam.map((topic) => topic.parent._id),
      ); //get all the parents, because the child categories does not count

      //check if the passingScore is greater than the maxScore
      if (passingScore && maxScore)
        this.checkPassingScore(passingScore, maxScore);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  private checkMaxTopics(maxTopics: number, topics: Category['_id'][]) {
    if (maxTopics && topics.length > maxTopics) {
      throw new BadRequestCustomResponse({
        title: 'Exam exceeds max topics limit',
        key: CustomErrorKeys.EXAM_EXCEEDS_MAX_TOPICS_LIMIT,
        detail: 'Exam exceeds max topics limit',
      });
    }

    //check if the request does not have the minimum of topics
    if (maxTopics && topics.length < 1) {
      throw new BadRequestCustomResponse({
        title: 'Exam does not have the minimum number of topics',
        key: CustomErrorKeys.EXAM_DOES_NOT_HAVE_MINIMUM_NUMBER_OF_TOPICS,
        detail: 'Exam does not have the minimum number of topics',
      });
    }
  }

  private checkPassingScore(passingScore: number, maxScore: number) {
    if (passingScore > maxScore) {
      throw new BadRequestCustomResponse({
        title: 'Invalid passing score',
        key: CustomErrorKeys.INVALID_PASSING_SCORE,
        detail: `Passing score must be less than or equal to ${maxScore}. The passing score is ${passingScore}.`,
      });
    }
  }

  /**
   * @description This function generates an exam with the provided topics and exam type.
   * @author Damian
   * @date 08/07/2025
   * @param {Category['_id'][]} topics
   * @param {ExamType['_id']} examType
   * @returns {*}
   * @memberof ExamsService
   */
  async generateExam(topics: Category['_id'][], examType: ExamType['_id']) {
    try {
      const storedExamType = await this.examTypesService.findOneByID(examType);
      //if topics are provided, get the topics
      let topicsOfTheExam: TopicsWithParent[] = [];
      if (topics.length > 0) {
        //check the topics.
        topicsOfTheExam = await this.getTopicsToGenerateExam(topics);
      } else {
        //if no topic is provided, get the first topic
        const topic = await this.categoriesService.findAllCategories({
          paginationParams: {
            limit: Infinity,
          },
        });
        topicsOfTheExam = await this.getTopicsToGenerateExam(
          topic.map((t) => t._id),
        );
      }
      this.checkMaxTopics(
        storedExamType.configuration.maxTopics,
        topicsOfTheExam.map((topic) => topic.parent._id), //get all the parents, because the child categories does not count
      );

      //create the information of the exam
      const informationPayload = this.generateInformationPayloadForExam(
        storedExamType,
        topicsOfTheExam,
        LanguagesEnum.ES, //TODO: recoger del cliente
      );

      const newExam = await this.createExam(
        {
          topics: extractUniqueCategoryIdsFromTopics(topicsOfTheExam),
          questions: [],
          examType: examType,
          information: informationPayload,
        },
        false,
      );
      return newExam;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * @description This function generates the title of the exam.
   * @author Damian
   * @date 11/07/2025
   * @private
   * @param {ExamType} storedExamType
   * @param {Category} topic
   * @returns {*}
   * @memberof ExamsService
   */
  private generateExamTitle(
    storedExamType: ExamType,
    topicsWithParents: TopicsWithParent[],
    language: string,
  ): KeyValue {
    try {
      let secondPartOfTitle = '';
      if (topicsWithParents.length > 1) {
        if (language === LanguagesEnum.ES) {
          secondPartOfTitle = examInformationJson.title.multipleTopics.es;
        } else {
          secondPartOfTitle = examInformationJson.title.multipleTopics.default;
        }
      } else {
        secondPartOfTitle =
          topicsWithParents[0].parent.title.languageMap[language];
      }
      const title = `${storedExamType.value} - ${secondPartOfTitle}`;
      return {
        [language]: title,
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  private generateExamSubtitle(
    topicsWithParents: TopicsWithParent[],
    language: string,
  ): KeyValue | null {
    try {
      let subtitle: KeyValue | null = null;
      if (language === LanguagesEnum.ES) {
        subtitle = {
          [language]: `${examInformationJson.subtitle.es} ${topicsWithParents.map((topicsWithParent) => topicsWithParent.parent.title.languageMap[language])}`,
        };
      } else {
        subtitle = {
          [language]: `${examInformationJson.subtitle.default} ${topicsWithParents.map((topicsWithParent) => topicsWithParent.parent.title.languageMap[language])}`,
        };
      }

      return subtitle;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  private generateExamBody(
    topicsWithParents: TopicsWithParent[],
    language: string,
  ): KeyValue | null {
    try {
      let body: KeyValue | null = null;
      if (language === LanguagesEnum.ES) {
        body = {
          [language]:
            examInformationJson.body.es +
            topicsWithParents
              .map(({ parent, childCategories }) => {
                const parentTitle = parent.title.languageMap[language];
                const childrenTitles = childCategories
                  .map((child) => child.title.languageMap[language])
                  .join(', ');
                return `• ${parentTitle}: ${childrenTitles}`;
              })
              .join('\n'),
        };
      } else {
        body = {
          [language]:
            examInformationJson.body.default +
            topicsWithParents
              .map(({ parent, childCategories }) => {
                const parentTitle = parent.title.languageMap[language];
                const childrenTitles = childCategories
                  .map((child) => child.title.languageMap[language])
                  .join(', ');
                return `• ${parentTitle}: ${childrenTitles}`;
              })
              .join('\n'),
        };
      }
      return body;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  private generateInformationPayloadForExam(
    storedExamType: ExamType,
    topicsWithParents: TopicsWithParent[],
    language: string,
  ): CreateInformationDto {
    try {
      //if the topicsWithParents is only 1 topic, the title will be "examtypename - parenttopicname"
      //else, the title will be "examtypename - multipletopics"

      //the subtitle will be "child topic names"
      //and the body will be "parent topic names with the child topics names"
      const title = this.generateExamTitle(
        storedExamType,
        topicsWithParents,
        language,
      );
      return {
        author: 'System', //TODO: user app user
        alias: normalizeString(title[language]),
        content: {
          language: language,
          title: title,
          subtitle: this.generateExamSubtitle(topicsWithParents, language),
          body: this.generateExamBody(topicsWithParents, language),
        },
      };
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * @description This function gets the topics to generate the exam.
   * @author Damian
   * @date 11/07/2025
   * @private
   * @param {Category['_id'][]} topics
   * @returns {*}  {Promise<Category[]>}
   * @memberof ExamsService
   */
  async getTopicsToGenerateExam(
    topics: Category['_id'][],
  ): Promise<TopicsWithParent[]> {
    try {
      //for each topic, find the topic to check if exists and push it to an array
      const topicsPassed = await Promise.all(
        topics.map(async (topicId) => {
          const storedTopic =
            await this.categoriesService.findCategoryWithParents(topicId);
          return storedTopic;
        }),
      );
      //create an empty array
      const topicsWithParents: TopicsWithParent[] = [];

      //for each topic of the new array:
      for (const topic of topicsPassed) {
        // if the topic is a parent, push it to a new array (if it is not already in the array)
        if (topic.parentCategories.length <= 0) {
          //check if the topic is already in the array
          const alreadyInArray = topicsWithParents.some(
            (topicsWithParent) => topicsWithParent.parent._id === topic._id,
          );
          if (!alreadyInArray)
            topicsWithParents.push({
              parent: topic,
              childCategories: [],
            });
        } else {
          // else (is a child), find his parent and push them to the new array
          const parentCategories = topic.parentCategories;
          for (const parentCategory of parentCategories) {
            const storedParentCategory =
              await this.categoriesService.findOneByID(parentCategory._id);
            //check if the parent is already in the array
            const alreadyInArray = topicsWithParents.find(
              (topicsWithParent) =>
                topicsWithParent.parent._id === storedParentCategory._id,
            );
            //if the parent is not in the array, create it
            if (!alreadyInArray) {
              topicsWithParents.push({
                parent: storedParentCategory,
                childCategories: [topic],
              });
            } else {
              //else, push the topic to the parent
              alreadyInArray.childCategories.push(topic);
            }
          }
        }
      }
      //then, with the second array, for each parent:
      for (const parentCategory of topicsWithParents) {
        const parentCategoryId = parentCategory.parent._id;
        //if the parent is empty, find ALL the children of the parent and push them to the parent
        if (parentCategory.childCategories.length <= 0) {
          const allChildren = await this.categoriesService.findAll(
            {
              filterOptions: {
                parentCategories: {
                  $in: [parentCategoryId],
                },
              },
            },
            {
              limit: Infinity,
            },
          );
          //push the children ids to the parent
          parentCategory.childCategories = allChildren;
        }
      }
      //finally, return the new array
      return topicsWithParents;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
