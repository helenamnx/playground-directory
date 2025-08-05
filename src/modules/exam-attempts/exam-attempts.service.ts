import { Injectable } from '@nestjs/common';
import { CreateExamAttemptDto } from './dto/create-exam-attempt.dto';
import { UpdateExamAttemptDto } from './dto/update-exam-attempt.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { ExamAttempt } from './schemas/exam-attempt.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExamsService } from '../exams/exams.service';
import { QuestionsService } from '../questions/questions.service';
import { ExamTypesService } from '../exam-types/exam-types.service';
import { Exam } from '../exams/schemas/exam.schema';
import {
  BadRequestCustomResponse,
  UnauthorizedCustomResponse,
} from '@/shared/responses/error/custom-error-response';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { ExamAttemptStatusEnum } from '@/shared/enums/exam-attempt-status.enum';
import { filterLanguageMap } from '@/shared/utils/filter-language-map.utils';
import { AppUser } from '../app-users/schemas/app-user.schema';
import {
  calculateTimeRemaining,
  clearArrayDuplicates,
  divideNumbers,
  getLastArrayItem,
  isDateIsBefore,
  isDateTimeIsInBetweenTwoDates,
  isTimeBefore,
  isTimeGreaterThanDuration,
  multiplyNumbers,
  roundTo,
  subtractNumbers,
} from '@/shared/utils/utils';
import {
  UpdateExamAttemptAnswerDto,
  UpdateExamAttemptAnswerNewDto,
} from './dto/update-exam-attempt-question.dto';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { ExamAttemptStatusesService } from '../exam-attempt-statuses/exam-attempt-statuses.service';
import { UserRolesService } from '../user-roles/user-roles.service';
import { AppUsersService } from '../app-users/app-users.service';
import { UserRole } from '../user-roles/schemas/user-role.schemas';
import { Category } from '../categories/schemas/category.schema';
import { ExamType } from '../exam-types/schemas/exam-type.schema';
import { GenerateExamAttemptDto } from './dto/generate-exam-attempt.dto';
import { Information } from '../information/schema/information.schema';
import { InformationService } from '../information/information.service';
import { Question } from '../questions/schemas/question.schema';
import { findOneByIdPopulates } from './populates/find-one-by-id';
import { ExamAttemptQuestionsService } from '../exam-attempt-questions/exam-attempt-questions.service';
import { CreateExamAttemptQuestionDto } from '../exam-attempt-questions/dto/create-exam-attempt-question.dto';
import { ExamAttemptQuestion } from '../exam-attempt-questions/schemas/exam-attempt-answer.schema';
import { ExamConfiguration } from '../exam-configurations/schemas/exam-configuration.schema';
@Injectable()
export class ExamAttemptsService extends CRUDService<ExamAttempt> {
  constructor(
    @InjectModel(ExamAttempt.name)
    private readonly examAttemptModel: Model<ExamAttempt>,
    private readonly examAttemptQuestionsService: ExamAttemptQuestionsService,
    private readonly examsService: ExamsService,
    private readonly appUsersService: AppUsersService,
    private readonly examTypesService: ExamTypesService,
    private readonly questionsService: QuestionsService,
    private readonly examAttemptStatusesService: ExamAttemptStatusesService,
  ) {
    super(examAttemptModel);
  }

  /**
   * @description This function checks if the exam is active and if the exam is timed.
   * @author Damian
   * @date 24/06/2025
   * @private
   * @param {Exam} exam
   * @param {Date} startTime
   * @memberof ExamAttemptsService
   */
  private async checkCreateExamAttempt(
    exam: Exam,
    startTime: Date,
    appUserId: AppUser['_id'],
  ) {
    try {
      //check if the exam is active
      if (!exam.configuration.isActive) {
        throw new BadRequestCustomResponse({
          title: 'Exam is not active',
          key: CustomErrorKeys.EXAM_IS_NOT_ACTIVE,
          detail: 'Exam is not active',
        });
      }

      //check if the exam is Visible
      if (!exam.configuration.isVisible) {
        throw new BadRequestCustomResponse({
          title: 'Exam is not visible',
          key: CustomErrorKeys.EXAM_IS_NOT_VISIBLE,
          detail: 'Exam is not visible',
        });
      }

      //check if the user has an exam attempt in process
      const latestAttempt = await super.findOne({
        filterOptions: { appUser: appUserId, exam: exam._id },
        sortOptions: { createdAt: -1 },
        populateOptions: [{ path: 'statusHistory', populate: 'status' }],
        triggerError: false,
      });
      ///if the user has an exam attempt
      if (latestAttempt) {
        //get the last status of the exam attempt
        const lastStatus = getLastArrayItem(latestAttempt.statusHistory);
        //check if the last status is IN_PROCESS. if so, throw an error
        if (lastStatus?.status.value === ExamAttemptStatusEnum.IN_PROCESS) {
          throw new BadRequestCustomResponse({
            title: 'User already has this exam in process',
            key: CustomErrorKeys.USER_ALREADY_HAS_EXAM_IN_PROCESS,
            detail: 'Exam is in process',
          });
        }
      }

      //check if the exam is timed
      //if the exam is timed, check if the start time is in between the start and end time of the exam
      if (
        exam.configuration.timed &&
        exam.configuration.startTime &&
        exam.configuration.endTime &&
        !isDateTimeIsInBetweenTwoDates(
          startTime,
          exam.configuration.startTime,
          exam.configuration.endTime,
        )
      ) {
        throw new BadRequestCustomResponse({
          title: 'Exam is not active',
          key: CustomErrorKeys.EXAM_IS_NOT_ACTIVE,
          detail: 'Exam is not active',
        });
      }

      //now check if the user is in the exam groups
      const storedAppUser = await this.appUsersService.findOne({
        filterOptions: {
          _id: appUserId,
        },
        populateOptions: [
          {
            path: 'userGroups',
            populate: ['group'],
          },
        ],
      });
      if (!this.isAppUserInExamGroups(storedAppUser, exam)) {
        throw new UnauthorizedCustomResponse({
          title: 'User is not in the exam groups',
          key: CustomErrorKeys.USER_IS_NOT_IN_EXAM_GROUPS,
          detail: 'User is not in the exam groups',
        });
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * @description This function finds a single exam attempt by its ID.
   * @author Damian
   * @date 24/06/2025
   * @param {string} id
   * @param {string} [lang]
   * @returns {*}  {Promise<ExamAttempt>}
   * @memberof ExamAttemptsService
   */
  async findOneById(
    id: string,
    appUserId: string,
    lang?: string,
  ): Promise<
    | void
    | ExamAttempt
    | {
        _id: string;
        status: string;
        score: number;
        message: string;
      }
  > {
    let storedExamAttempt = await super.findOne({
      filterOptions: {
        _id: id,
        appUser: appUserId,
      },
      ...findOneByIdPopulates(),
    });
    const { configuration } = storedExamAttempt.exam;
    let durationOfExamAttempt: number = null;
    if (configuration.timed) {
      durationOfExamAttempt = calculateTimeRemaining({
        startTime: storedExamAttempt.startTime,
        examStartDate: configuration.startTime,
        examEndDate: configuration.endTime,
        examDuration: configuration.duration,
      });

      //if the duration of the exam is less than or equal to 0, update the exam attempt status to finished
      if (durationOfExamAttempt === 0) {
        return await this.finishExamDueToTimeExpired(
          storedExamAttempt._id,
          appUserId,
        );
      }
    }

    const lastStatus = getLastArrayItem(storedExamAttempt.statusHistory);

    //if the exam does not show answers, delete the questions to prevent leaking the answers
    if (!configuration.showAnswers) {
      delete storedExamAttempt.questions;
    }
    //delete the exam configuration to prevent leaking the exam configuration
    delete storedExamAttempt.exam.configuration;
    if (lang) {
      return filterLanguageMap(
        {
          ...storedExamAttempt.toObject(),
          duration: durationOfExamAttempt,
          statusHistory: lastStatus.toObject(),
        },
        lang,
      ) as ExamAttempt;
    }
    return { ...storedExamAttempt.toObject(), duration: durationOfExamAttempt };
  }

  /**
   * @description This function updates an exam attempt.
   * @author Damian
   * @date 25/06/2025
   * @param {UpdateExamAttemptDto} updateExamAttemptDto
   * @memberof ExamAttemptsService
   */
  async updateExamAttempt(updateExamAttemptDto: UpdateExamAttemptDto) {
    try {
      const { _id, endTime, status, appUserId } = updateExamAttemptDto;
      // let finalScore: number;
      //check if the exam attempt exists
      const storedExamAttempt = await super.findOne({
        filterOptions: {
          _id,
        },
        populateOptions: [
          {
            path: 'statusHistory',
            populate: 'status',
          },
          //TODO: quitar a pelo
          {
            path: 'exam',
            populate: [
              'examType',
              'configuration',
              { path: 'questions', populate: ['answerOptions'] },
            ],
          },
          { path: 'questions', populate: ['question', 'answers'] },
          'appUser',
        ],
      });
      const { exam } = storedExamAttempt;
      const { configuration } = exam;
      //check if the exam is inProcess
      this.checkIfExamIsInProcess(storedExamAttempt);
      //check if the user is the owner of the exam attempt
      this.checkIfOwner(appUserId, storedExamAttempt);
      //check exam time if the exam is not finished
      if (this.canCheckExamTime(endTime, status))
        await this.checkExamTime(appUserId, endTime, storedExamAttempt);

      //update the exam attempt status
      await this.addNewStatusHistory(status, storedExamAttempt);
      //check the exam attempt status. If the exam status is finished, then calculate the final score
      if (this.isExamFinished(status)) {
        await this.updateExamAfterFinished(
          storedExamAttempt,
          configuration,
          endTime || new Date(),
        );
      }

      //return the exam attempt
      const updatedExamAttempt = await super.findOne({
        filterOptions: {
          _id: storedExamAttempt._id,
        },
        populateOptions: [
          {
            path: 'statusHistory',
            populate: 'status',
          },
          {
            path: 'questions',
            populate: {
              path: 'answers',
            },
          },
        ],
      });
      return this.updateExamAttemptResponse(updatedExamAttempt);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private canCheckExamTime(endTime: Date, status: string): boolean {
    const { ABANDONED, FINISHED } = ExamAttemptStatusEnum;
    //array of statuses that does not require to check the exam time constraints
    const statusWithNoTimeCheck = [ABANDONED, FINISHED] as string[];
    //if endTIme is passed, and the status of the exam provided is not in the array, return true
    return endTime && !statusWithNoTimeCheck.includes(status);
  }

  private async addNewStatusHistory(
    status: string,
    storedExamAttempt: ExamAttempt,
  ) {
    const newStatusHistory =
      await this.examAttemptStatusesService.createExamAttemptStatus({
        value: status,
      });
    await super.update(storedExamAttempt._id, {
      $push: {
        statusHistory: newStatusHistory._id,
      },
    });
  }

  /**
   * @description This function updates an exam attempt after it has finished.
   * @author Damian
   * @date 21/07/2025
   * @private
   * @param {ExamAttempt} storedExamAttempt
   * @param {ExamConfiguration} configuration
   * @param {Date} endTime
   * @memberof ExamAttemptsService
   */
  private async updateExamAfterFinished(
    storedExamAttempt: ExamAttempt,
    configuration: ExamConfiguration,
    endTime: Date,
  ) {
    const newStatusHistory =
      await this.examAttemptStatusesService.createExamAttemptStatus({
        value:
          storedExamAttempt.score >= configuration.passingScore
            ? ExamAttemptStatusEnum.APPROVED
            : ExamAttemptStatusEnum.FAILED,
      });
    await super.update(storedExamAttempt._id, {
      // score: finalScore,
      endTime: endTime,
      $push: {
        statusHistory: newStatusHistory._id,
      },
    });
  }

  /**
   * @description This function checks if the user is the owner of the exam attempt.
   * @author Damian
   * @date 24/06/2025
   * @private
   * @param {AppUser['_id']} appUserId
   * @param {ExamAttempt} storedExamAttempt
   * @memberof ExamAttemptsService
   */
  private checkIfOwner(
    appUserId: AppUser['_id'],
    storedExamAttempt: ExamAttempt,
  ): void {
    //if the appUserId is not the same as the appUserId of the exam attempt, throw an error
    if (storedExamAttempt.appUser._id !== appUserId) {
      throw new UnauthorizedCustomResponse({
        title: 'User is not the owner of the exam attempt',
        key: CustomErrorKeys.USER_IS_NOT_OWNER_OF_EXAM_ATTEMPT,
        detail: 'User is not the owner of the exam attempt',
      });
    }
  }

  /**
   * @description This function checks if the exam attempt is on the time limits considered by the exam.
   * @author Damian
   * @date 25/06/2025
   * @private
   * @param {Date} examAttemptEndTime
   * @param {ExamAttempt} examAttempt
   * @returns {*}  {Promise<void>}
   * @memberof ExamAttemptsService
   */
  private async checkExamTime(
    appUserId: string,
    examAttemptEndTime: Date,
    examAttempt: ExamAttempt,
  ): Promise<void> {
    try {
      const { exam, startTime: examStartTime } = examAttempt;
      const { configuration } = exam;
      const {
        timed,
        startTime: configurationStartTime,
        endTime: configurationEndTime,
        duration,
      } = configuration;
      //first, check if the exam endTime is between the exam startDate and the exam endDate
      //if so, update the exam attempt status to failed and throw an error
      if (
        configurationStartTime &&
        configurationEndTime &&
        !isDateTimeIsInBetweenTwoDates(
          examAttemptEndTime,
          configurationStartTime,
          configurationEndTime,
        )
      ) {
        //finish exam due to time expired
        await this.finishExamDueToTimeExpired(examAttempt._id, appUserId);
      }
      //then, check if the exam is timed
      //if the exam is timed, check if the user took longer than the duration of the exam
      //if so, update the exam attempt status to failed and throw an error
      if (
        timed &&
        isTimeGreaterThanDuration(examStartTime, examAttemptEndTime, duration)
      ) {
        {
          //finish exam due to time expired
          await this.finishExamDueToTimeExpired(examAttempt._id, appUserId);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description This function checks if the answers provided by the user are valid.
   * @author Damian
   * @date 25/06/2025
   * @private
   * @param {CreateExamAttemptAnswerDto[]} answers
   * @param {ExamAttempt} examAttempt
   * @memberof ExamAttemptsService
   */
  private async checkExamAttemptAnswers(
    answers: CreateExamAttemptQuestionDto[],
    examAttempt: ExamAttempt,
  ) {
    try {
      const { exam } = examAttempt;
      //for each answer, check if the question exists on the exam, and check if the answer options exists on the question
      await Promise.all(
        answers.map(async (answer) => {
          try {
            const { question, answers } = answer;
            //find the question
            const storedQuestion = await this.questionsService.findOneById({
              id: question,
            });
            //for each answer options, check if the answer option exists on the question
            await Promise.all(
              answers.map(async (answerOption) => {
                //find the answer option
                const storedAnswerOption =
                  await this.questionsService.findAnswerOptionById(
                    answerOption,
                  );

                //if the answer option does not exists on the question, throw an error
                const exists = storedQuestion.answerOptions.some(
                  (ao) =>
                    ao._id.toString() === storedAnswerOption._id.toString(),
                );
                if (!exists) {
                  throw new BadRequestCustomResponse({
                    title: 'Answer option does not exists on this question',
                    key: CustomErrorKeys.ANSWER_OPTION_NOT_FROM_THIS_QUESTION,
                    detail: 'Answer option does not exists on this question',
                  });
                }
              }),
            );
            //if the question does not exists on the exam, throw an error
            const exists = exam.questions.some(
              (q) => q._id.toString() === storedQuestion._id.toString(),
            );

            if (!exists) {
              throw new BadRequestCustomResponse({
                title: 'Question does not exists on this exam',
                key: CustomErrorKeys.QUESTION_NOT_FROM_THIS_EXAM,
                detail: 'Question does not exists on this exam',
              });
            }
          } catch (e) {
            console.log(e);
            throw e;
          }
        }),
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private async upsertExamAttemptAnswers(
    answers: CreateExamAttemptQuestionDto[],
    examAttempt: ExamAttempt,
  ) {
    try {
      //first, get the questions from the exam attempt
      const { questions: storedQuestions, exam } = examAttempt;
      //then, for each question of the answers of the dto
      const newExamAttemptAnswerIds = await Promise.all(
        answers.map(async (answer) => {
          const { question, answers } = answer;
          //find the question
          const storedQuestion = await this.questionsService.findOneById({
            id: question,
          });
          //if the exam attempt already have an answer for that question, update it
          const alreadyExistingAnswer = storedQuestions.find(
            (answer) => answer.question._id === storedQuestion._id,
          );
          if (alreadyExistingAnswer) {
            await this.examAttemptQuestionsService.update(
              alreadyExistingAnswer._id,
              {
                answers: answers,
              },
            );
          } else {
            //if not, create the new answer
            return (
              await this.examAttemptQuestionsService.createExamAttemptQuestion({
                answers: answers,
                question: storedQuestion._id,
              })
            )._id;
          }
        }),
      );

      //finally, push all the questions to the exam attempt and return it
      return await super.update(examAttempt._id, {
        $push: {
          questions: newExamAttemptAnswerIds,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description This function calculates the score of the exam attempt.
   * @author Damian
   * @date 25/06/2025
   * @private
   * @param {ExamAttempt['_id']} examAttemptId
   * @returns {*}  {Promise<number>}
   * @memberof ExamAttemptsService
   */
  private async calculateExamAttemptScore(
    examAttemptId: ExamAttempt['_id'],
  ): Promise<number> {
    try {
      let finalScore: number = 0; //the finalScore that must be summed and returned
      let sumOfQuestionsWeight: number = 0; //the sum of the weights of all the questions
      let maxScore: number = 0; //the maxScore of the examConfiguration
      let realQuestionWeight: number = 0; //the weight of the question divided by the maxScore
      let positiveScore: number = 0; //the sum of the positive marks of the questions
      let negativeScore: number = 0; //the sum of the negative marks of the questions
      //first, find the exam attempt with the answers populated and the exam populated
      const storedExamAttempt = await super.findOne({
        filterOptions: {
          _id: examAttemptId,
        },
        populateOptions: [
          {
            path: 'statusHistory',
            populate: 'status',
          },
          {
            path: 'exam',
            populate: [
              'examType',
              'configuration',
              {
                path: 'questions',
                populate: ['answerOptions', 'configuration'],
              },
            ],
          },
          {
            path: 'questions',
            populate: [
              'answers',
              {
                path: 'question',
                populate: ['configuration'],
              },
            ],
          },
        ],
      });
      maxScore = storedExamAttempt.exam.configuration.maxScore; //the maxScore of the examConfiguration
      //for each answer, get the configuration of the question and sum the weight of all the questions
      storedExamAttempt.questions.map((examAttemptQuestion) => {
        const questionWeight =
          examAttemptQuestion.question.configuration.weight;
        sumOfQuestionsWeight += questionWeight;
      });
      //then: divide the sum of the weights by the maxScore
      (realQuestionWeight = divideNumbers(maxScore, sumOfQuestionsWeight)),
        //then:for each question of the answers, compare if the answerOption was correct
        //if was correct, sum the multiplied result of the question with the finalScore
        //if not, if the question has negativeMarking, rest the finalScore with the negativeMarking
        storedExamAttempt.questions.map((examAttemptQuestion) => {
          if (
            examAttemptQuestion.answers &&
            examAttemptQuestion.answers.length <= 0
          )
            return; //if the questions has no answers, skip it, because it's not answered
          const answer = examAttemptQuestion.answers
            ? examAttemptQuestion.answers[0]
            : null; //TODO: next iteration check the multi-valued answers
          if (!answer) return;
          const question = examAttemptQuestion.question;
          const questionConfiguration = question.configuration;
          const negativeMarking = questionConfiguration.negativeMarking;
          //if the answerOption is correct, multiply the result by the realQuestionWeight
          if (answer.isCorrect) {
            positiveScore += multiplyNumbers(
              realQuestionWeight,
              questionConfiguration.weight,
            );
          } else {
            //if the answerOption is not correct, if the question has negativeMarking,
            //multiply the realQuestionWeight by the negativeMarking
            if (negativeMarking > 0) {
              negativeScore += multiplyNumbers(
                realQuestionWeight,
                negativeMarking,
              );
            }
          }
        });
      //subtract the positiveScore and the negativeScore and round the result to the nearest integer
      finalScore = subtractNumbers(positiveScore, negativeScore);
      finalScore = roundTo(finalScore);
      //and finally return the finalScore
      //if the finalScore is negative, set it to 0
      return finalScore < 0 ? 0 : finalScore;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * @description This function calculates the status of the exam attempt based on the finalScore.
   * @author Damian
   * @date 25/06/2025
   * @private
   * @param {number} finalScore
   * @param {number} passingScore
   * @returns {*}
   * @memberof ExamAttemptsService
   */
  private getStatusByFinalScore(
    finalScore: number,
    passingScore: number,
  ): ExamAttemptStatusEnum {
    return finalScore < passingScore
      ? ExamAttemptStatusEnum.FAILED
      : ExamAttemptStatusEnum.APPROVED;
  }

  /**
   * @description This function checks if the exam is in process.
   * @author Damian
   * @date 25/06/2025
   * @private
   * @param {ExamAttempt} examAttempt
   * @memberof ExamAttemptsService
   */
  private checkIfExamIsInProcess(examAttempt: ExamAttempt): void {
    try {
      const { IN_PROCESS } = ExamAttemptStatusEnum;
      const lastStatus = getLastArrayItem(examAttempt.statusHistory);
      console.log('lastStatus', lastStatus);
      if (lastStatus.status.value !== IN_PROCESS) {
        throw new BadRequestCustomResponse({
          title: 'Exam is not in process',
          key: CustomErrorKeys.EXAM_IS_NOT_IN_PROCESS,
          detail: 'Exam is not in process',
        });
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * @description This function checks if the exam attempt is completed.
   * @author Damian
   * @date 25/06/2025
   * @private
   * @param {string} status
   * @returns {*}  {boolean}
   * @memberof ExamAttemptsService
   */
  private isExamFinished(status: string): boolean {
    const { FINISHED } = ExamAttemptStatusEnum;
    return status === FINISHED;
  }

  /**
   * @description This function checks if the user has surpassed the number of attempts.
   * @author Damian
   * @date 25/06/2025
   * @private
   * @param {number} examAttempts
   * @param {string} appUserId
   * @param {string} examId
   * @memberof ExamAttemptsService
   */
  private async checkIfUserSurpassedAttempts(
    examAttempts: number,
    appUserId: string,
    examId: string,
  ) {
    try {
      const storedExamAttemptsOfUser = await super.findAll({
        filterOptions: {
          appUser: appUserId,
          exam: examId,
        },
      });
      if (storedExamAttemptsOfUser.length >= examAttempts) {
        throw new BadRequestCustomResponse({
          title: 'User has surpassed the number of attempts',
          key: CustomErrorKeys.USER_HAS_SURPASSED_ATTEMPTS,
          detail: 'User has surpassed the number of attempts',
        });
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  // async deprecatedUpdateExamAttemptAnswer(
  //   answer: UpdateExamAttemptAnswerDto,
  //   language: string,
  // ) {
  //   try {
  //     //TODO: check if the question and the answerOptions exists on this exam
  //     const { appUserId, examAttempt, question, answerOptions } = answer;
  //     const storedExamAttempt = await super.findOne({
  //       filterOptions: {
  //         _id: examAttempt,
  //         appUser: appUserId,
  //       },
  //       populateOptions: [
  //         {
  //           path: 'statusHistory',
  //           populate: 'status',
  //         },
  //         {
  //           path: 'answers',
  //           populate: 'answerOptions',
  //         },
  //         {
  //           path: 'exam',

  //           populate: ['configuration', 'questions'],
  //         },
  //       ],
  //     });

  //     //check if the answer is valid (exists on this exam)
  //     await this.checkExamAttemptAnswers([answer], storedExamAttempt);
  //     //check the exam attempt status
  //     this.checkIfExamIsInProcess(storedExamAttempt);

  //     const { configuration } = storedExamAttempt.exam;
  //     const durationOfExamAttempt = calculateTimeRemaining({
  //       startTime: storedExamAttempt.startTime,
  //       examStartDate: configuration.startTime,
  //       examEndDate: configuration.endTime,
  //       examDuration: configuration.duration,
  //     });
  //     if (durationOfExamAttempt <= 0) {
  //       const updatedExamAttempt = await this.updateExamAttempt({
  //         _id: storedExamAttempt._id,
  //         status: ExamAttemptStatusEnum.FINISHED,
  //         appUserId: appUserId,
  //         endTime: new Date(),
  //       });
  //       return {
  //         ...updatedExamAttempt,
  //         message: 'The exam has finished due to time limit', //TODO: sacar este string a pelo
  //       };
  //     }
  //     //get the stored question
  //     const storedQuestion = await this.questionsService.findOne({
  //       filterOptions: {
  //         _id: question,
  //       },
  //       populateOptions: ['answerOptions'],
  //     });

  //     //update the exam attempt answer

  //     //create the new examAttemptAnswer
  //     const newExamAttemptAnswer =
  //       await this.examAttemptQuestionsService.createExamAttemptAnswer({
  //         question: question,
  //         answerOptions: answerOptions,
  //       });

  //     await super.update(storedExamAttempt._id, {
  //       $push: {
  //         answers: newExamAttemptAnswer._id,
  //       },
  //     });

  //     //calculate the score of the exam attempt
  //     let score = await this.calculateExamAttemptScore(storedExamAttempt._id);
  //     //TODO:
  //     // if (typeof score !== 'number') {
  //     //   score = 0;
  //     // }
  //     await super.update(storedExamAttempt._id, {
  //       score: score,
  //     });

  //     //get the exam attempt answer
  //     const storedExamAttemptAnswer =
  //       await this.examAttemptQuestionsService.findOne({
  //         filterOptions: {
  //           _id: newExamAttemptAnswer._id,
  //         },
  //         populateOptions: ['answerOptions'],
  //         selectOptions: ['-history', '-question'],
  //       });
  //     //if the exam configuration have showAnswer, return the answer
  //     if (!storedExamAttempt.exam.configuration.showAnswers) return;
  //     //then, if the answer option was correct, return the answerOption with score
  //     //if there are no answerOptions, go to the else statement
  //     if (storedExamAttemptAnswer?.answerOptions[0]?.isCorrect) {
  //       return filterLanguageMap(
  //         {
  //           ...storedExamAttemptAnswer.toObject(),
  //           score: score,
  //         },
  //         language,
  //       );
  //       //else, return the answerOption, and the correct one with score
  //     } else {
  //       const correctAnswerOption = storedQuestion.answerOptions.find(
  //         (answerOption) => answerOption.isCorrect,
  //       );
  //       let payload = {
  //         ...storedExamAttemptAnswer.toObject(),
  //         correctAnswerOption: correctAnswerOption.toObject(),
  //         score: score,
  //       };
  //       return filterLanguageMap(payload, language);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // }

  async updateExamAttemptQuestion(
    updateExamAttemptQuestion: UpdateExamAttemptAnswerNewDto,
    language: string,
  ) {
    try {
      //TODO: check if the question and the answerOptions exists on this exam
      const {
        appUserId,
        examAttempt,
        examAttemptQuestion,
        answers: answersFromDto,
      } = updateExamAttemptQuestion;
      //find the exam attempt
      const storedExamAttempt = await super.findOne({
        filterOptions: {
          _id: examAttempt,
          appUser: appUserId,
        },
        populateOptions: [
          {
            path: 'statusHistory',
            populate: 'status',
          },
          {
            path: 'questions',
            populate: 'answers',
          },
          {
            path: 'exam',

            populate: ['configuration', 'questions'],
          },
        ],
      });
      //get the exam attempt question
      const storedExamAttemptQuestion =
        await this.examAttemptQuestionsService.findOne({
          filterOptions: {
            _id: examAttemptQuestion, // the id of the question
          },
          populateOptions: ['answers'],
          selectOptions: ['-history'],
        });

      //check if the answer is valid (exists on this exam)
      // await this.checkExamAttemptAnswers([answer], storedExamAttempt)// TODO: check if the answerOptions exists
      //check the exam attempt status
      this.checkIfExamIsInProcess(storedExamAttempt);

      const { configuration } = storedExamAttempt.exam;
      if (configuration.timed) {
        const durationOfExamAttempt = calculateTimeRemaining({
          startTime: storedExamAttempt.startTime,
          examStartDate: configuration.startTime,
          examEndDate: configuration.endTime,
          examDuration: configuration.duration,
        });
        //if the duration of the exam is less than or equal to 0, update the exam attempt status to finished
        if (durationOfExamAttempt === 0) {
          await this.finishExamDueToTimeExpired(
            storedExamAttempt._id,
            appUserId,
          );
        }
      }

      //update the exam attempt question from the specific question
      const updatedExamAttemptQuestion =
        await this.examAttemptQuestionsService.update(
          storedExamAttemptQuestion._id,
          {
            answers: answersFromDto,
          },
          [
            {
              path: 'answers',
            },
          ],
        );

      //calculate the score of the exam attempt
      let score = await this.calculateExamAttemptScore(storedExamAttempt._id);
      //TODO:
      // if (typeof score !== 'number') {
      //   score = 0;
      // }
      await super.update(storedExamAttempt._id, {
        score: score,
      });

      //if the exam configuration have showAnswer, return the answer
      if (!storedExamAttempt.exam.configuration.showAnswers) return;

      //then, if the answer option was correct, return the answerOption with score
      //if there are no answerOptions, go to the else statement
      //TODO: no usar [0] y verificar si la pregunta es multivalued
      const answers = updatedExamAttemptQuestion?.answers;
      if (!answers) {
        return await this.badAnswerResponse(
          updatedExamAttemptQuestion,
          score,
          language,
        );
      }

      if (answers[0]?.isCorrect) {
        return filterLanguageMap(
          {
            score: score,
            isCorrect: answers[0].isCorrect,
          },
          language,
        );
        //else, return the answerOption, and the correct one with score
      } else {
        return await this.badAnswerResponse(
          updatedExamAttemptQuestion,
          score,
          language,
        );
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * @description
   * @author Damian
   * @date 22/07/2025
   * @private
   * @param {ExamAttempt} storedExamAttempt
   * @param {string} appUserId
   * @memberof ExamAttemptsService
   */
  private async finishExamDueToTimeExpired(
    examAttemptId: ExamAttempt['_id'],
    appUserId: string,
  ) {
    await this.updateExamAttempt({
      _id: examAttemptId,
      status: ExamAttemptStatusEnum.FINISHED,
      appUserId: appUserId,
      endTime: new Date(),
    });
    throw new BadRequestCustomResponse({
      title: 'Exam time is expired',
      key: CustomErrorKeys.EXAM_TIME_IS_EXPIRED,
      detail: 'Exam time is expired',
    });
  }

  /**
   * @description This function returns the response when
   * the answer is wrong. Its only used on the updateExamAttemptQuestion function.
   * @author Damian
   * @date 10/07/2025
   * @private
   * @param {ExamAttemptQuestion} storedExamAttemptQuestion
   * @param {number} score
   * @param {string} language
   * @returns {*}
   * @memberof ExamAttemptsService
   */
  private async badAnswerResponse(
    storedExamAttemptQuestion: ExamAttemptQuestion,
    score: number,
    language: string,
  ) {
    const storedQuestion = await this.questionsService.findOne({
      filterOptions: {
        _id: storedExamAttemptQuestion.question,
      },
      populateOptions: ['answerOptions'],
      selectOptions: ['-history', '-topics'],
    });
    //find the correct answer option
    const correctAnswerOption = storedQuestion.answerOptions.find(
      (answerOption) => answerOption.isCorrect,
    );
    let payload = {
      correctAnswerOptionId: correctAnswerOption?._id,
      isCorrect: false,
      justification: correctAnswerOption?.justification,
      score: score,
    };
    return filterLanguageMap(payload, language);
  }

  //TODO: refactor
  /**
   * @description This function finds all the exams that the user has attempted.
   *  If the user is an admin, it returns all the exams. Otherwise, it returns only the exams where the user is the owner.
   * @author Damian
   * @date 26/06/2025
   * @param {{
   *     appUser: AppUser;
   *     filterOptions?: any;
   *     paginationParams?: any;
   *     lang?: string;
   *   }} params
   * @returns {*}
   * @memberof ExamAttemptsService
   */
  async findAllMyExams(params: {
    appUser: AppUser;
    filterOptions?: any;
    paginationParams?: any;
    lang?: string;
  }) {
    try {
      //if the role is admin, return all the exams
      //if the role is not admin, return all the exams where the user is the owner

      //first, check the role of the user
      const { appUser, filterOptions, paginationParams, lang } = params || {};

      if (
        appUser.user.roles.some(
          (role) => role.alias === RolesEnum.ADMINISTRATOR,
        )
      ) {
        return this.examsService.findAllExams({
          filterOptions,
          paginationParams,
          lang,
        });
      } else {
        let storedUserExams = await this.examsService.findAllExams({
          filterOptions: {
            ...filterOptions,
          },
          paginationParams,
          lang,
        });
        //filter the exam by the groups that the user belongs to
        storedUserExams = storedUserExams.filter((exam) => {
          const configuration = exam.configuration;
          //if the exam has endTime, and the the actual date is after the endTime, return false
          if (
            configuration.endTime &&
            isDateIsBefore(configuration.endTime, new Date())
          ) {
            return false;
          }
          //if the exam is not visible or is not active,
          if (!configuration.isVisible || !configuration.isActive) return false;

          const examGroups = exam.configuration.groups;
          const userGroups = appUser.userGroups;
          //check if the user belongs to all the groups that the exam is in
          return examGroups.every((examGroup) =>
            userGroups.some(
              (userGroup) => userGroup.group._id === examGroup._id,
            ),
          );
        });

        const examIds = storedUserExams.map((exam) => exam._id);

        // Buscar los últimos intentos por examen y appUser

        const examAttempts = await this.examAttemptModel.aggregate([
          {
            $match: {
              exam: { $in: examIds },
              appUser: appUser._id,
            },
          },

          { $sort: { createdAt: -1 } }, // ordenamos del más reciente al más viejo
          {
            $group: {
              _id: '$exam',
              latestAttempt: { $first: '$$ROOT' },
            },
          },
        ]);

        // Convertir en un Map para acceso fácil por ID
        const latestAttemptIds = examAttempts.map(
          (entry) => entry.latestAttempt._id,
        );

        const populatedAttempts = await this.examAttemptModel
          .find({ _id: { $in: latestAttemptIds } })
          .populate([
            {
              path: 'questions',
              select: ['answers'],
            },
            {
              path: 'statusHistory',
              populate: {
                path: 'status', // esto popula el campo `status` dentro de cada `statusHistory`
              },
            },
          ]);
        // En vez de Map, usar un objeto plano con claves string:
        const populatedDict: Record<string, any> = {};
        populatedAttempts.forEach((attempt) => {
          populatedDict[attempt.exam.toString()] = attempt.toObject();
        });

        const examsWithAttempts = storedUserExams.map((exam) => {
          let lastAttempt = populatedDict[exam._id.toString()] ?? null;
          const lastStatus: any = lastAttempt
            ? getLastArrayItem(lastAttempt?.statusHistory)
            : null;
          //if the lastStatus is InProcess, return the lastAttempt
          //else, return null
          if (
            lastAttempt &&
            lastStatus?.status?.value === ExamAttemptStatusEnum.IN_PROCESS
          ) {
            lastAttempt = {
              ...lastAttempt,
              statusHistory: lastStatus,
            };
          } else {
            lastAttempt = null;
          }

          return filterLanguageMap(
            {
              ...(exam.toObject?.() ?? exam),
              latestExamAttempt: lastAttempt,
            },
            lang,
          );
        });
        // return examsWithAttempts.filter((exam) => {
        //   const author = exam.information.author;

        //   //TODO: cambiar esto por el usuario actual

        //   // if (exam.latestExamAttempt) return true;
        //   if (author !== 'System') return false;
        //   return true;
        // });
        return examsWithAttempts;
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  //TODO: refactor
  async findExamHistory(params: {
    appUser: AppUser;
    filterOptions?: any;
    paginationParams?: any;
    lang?: string;
  }) {
    try {
      //get the exam with the attempts populated by user
      const {
        appUser,
        filterOptions = {},
        paginationParams = {},
        lang,
      } = params;
      const { examType, topics } = filterOptions;
      const { limit = 10, skip = 0 } = paginationParams;
      //TODO: refactor
      const query: any = {};
      let examIds: string[] = [];

      const examFilter: any = {};
      if (examType) {
        examFilter.examType = examType;
      }
      if (topics && topics.length) {
        examFilter.topics = { $in: topics };
      }
      // Obtener solo exámenes que cumplan ambos criterios
      const storedExams = await this.examsService.findAll(
        {
          filterOptions: { ...examFilter },
        },
        { limit: Infinity },
      );
      examIds = storedExams.map((exam) => exam._id);

      // Si no hay coincidencias y había filtros, no hay resultados posibles
      if (!examIds.length) {
        return [];
      }

      query.exam = { $in: examIds };

      // Buscar los examAttempts
      let storedExamAttempts = await super.findAll(
        {
          triggerError: false,
          filterOptions: {
            appUser: appUser._id,
            ...query,
          },
          populateOptions: [
            {
              path: 'statusHistory',

              populate: {
                path: 'status',
              },
            },
            {
              path: 'exam',
              select: ['-questions'],
              populate: [
                {
                  path: 'configuration',
                  select: ['numberOfQuestions', 'showAnswers'],
                },
                {
                  path: 'topics',
                  select: ['_id', 'title'],
                },
                {
                  path: 'examType',
                },
              ],
            },
            {
              path: 'questions',
              select: ['-history', '-question'],
              populate: {
                path: 'answers',
                select: ['-value'],
              },
            },
          ],
        },
        paginationParams,
      );
      //only return the exams attempts if the show answers is true
      //if show answers attributes is false, if the last status is finished, failed or approved, return the exam attempt
      storedExamAttempts = storedExamAttempts.filter(
        (examAttempt: ExamAttempt) => {
          const hasExamShowAnswers = examAttempt.exam.configuration.showAnswers;
          //if the exam does not showAnswers,
          if (!hasExamShowAnswers) {
            // only return the exam attempts with the last status finished, failed or approved
            const lastStatus = getLastArrayItem(examAttempt.statusHistory);
            if (!lastStatus) return false;
            const lastStatusValue = lastStatus.status.value;
            const { FINISHED, FAILED, APPROVED, ABANDONED } =
              ExamAttemptStatusEnum;
            const allowedStatuses = [
              FINISHED,
              FAILED,
              APPROVED,
              ABANDONED,
            ] as string[];
            if (allowedStatuses.includes(lastStatusValue)) {
              return true;
            } else {
              return false;
            }
          } else {
            return true;
          }
        },
      );

      if (lang) {
        return storedExamAttempts.map((item) =>
          filterLanguageMap(item.toObject(), lang),
        ) as ExamAttempt[];
      }
      return storedExamAttempts;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async checkUserRoles(appUserId: AppUser['_id'], allowedRoles: UserRole[]) {
    const storedAppUser = await this.appUsersService.findOne({
      filterOptions: {
        _id: appUserId,
      },
      populateOptions: [
        {
          path: 'user',
          populate: ['roles'],
        },
      ],
    });
    const userRoles = storedAppUser.user.roles;
    const intersection = userRoles.filter((role) =>
      allowedRoles.includes(role),
    );
    if (intersection.length === 0) {
      throw new BadRequestCustomResponse({
        title: 'User does not have the required roles',
        key: CustomErrorKeys.USER_DOES_NOT_HAVE_REQUIRED_ROLES,
        detail: 'User does not have the required roles',
      });
    }
  }

  /**
   * @description This function generates an exam attempt.
   * @author Damian
   * @date 04/07/2025
   * @param {GenerateExamAttemptDto} generateExamAttemptDto
   * @returns {*}
   * @memberof ExamAttemptsService
   */
  async createExamAttempt(generateExamAttemptDto: GenerateExamAttemptDto) {
    try {
      const startTime = new Date();
      let { topics, examType, appUser, language, exam } =
        generateExamAttemptDto;
      //if topics exists, clear the duplicated topics
      //else, topics will be an empty array
      if (topics) {
        topics = clearArrayDuplicates(topics);
      } else {
        topics = [];
      }
      //first, get or create the exam
      const storedExam = await this.getOrCreateExam(topics, examType, exam);
      //if examId is provided, find the lastAttempt of the user
      if (storedExam) {
        //if the user has already attempted the exam, check if the user can attempt again
        const lastUserAttempt = await this.getLastAttemptOfUser(
          storedExam,
          appUser,
        );
        if (lastUserAttempt) this.checkIfUserCanAttempt(lastUserAttempt);
      }
      //validate the exam: groups, examType, topics
      await this.checkCreateExamAttempt(storedExam, startTime, appUser);

      //check if the user has attempted the exam more than the permitted number of attempts
      if (storedExam.configuration.maxAttempts) {
        await this.checkIfUserSurpassedAttempts(
          storedExam.configuration.maxAttempts,
          appUser,
          storedExam._id,
        );
      }

      //then, create the exam attempt with the provided exam
      const newExamAttempt = await this.generateExamAttempt(
        storedExam,
        appUser,
      );

      return { _id: newExamAttempt._id };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  private async getOrCreateExam(
    topics: Category['_id'][],
    examType: ExamType['_id'],
    examId: Exam['_id'],
  ) {
    try {
      //if exam id is provided, find the exam
      if (examId) {
        //get the exam but the topics, examType and level
        let exam = await this.examsService.findOne({
          filterOptions: {
            _id: examId,
          },
          populateOptions: [
            { path: 'configuration', populate: 'groups' },
            'topics',
            'questions',
          ],
        });
        return exam;
      }
      //if the examId is not provided, get the exam by the topics and examType
      let exam = await this.examsService.findOne({
        filterOptions: {
          topics: topics,
          examType: examType,
        },
        populateOptions: [
          { path: 'configuration', populate: 'groups' },
          'topics',
          'questions',
          'examType',
        ],
        triggerError: false,
      });
      //if exists, return the exam
      if (exam) return exam;
      //else, create the exam
      //check if the exam can be autogenerated
      const storedExamType = await this.examTypesService.findOne({
        filterOptions: {
          _id: examType,
        },
        populateOptions: ['configuration'],
      });
      //if the exam cannot be autogenerated, throw an error
      if (!storedExamType.configuration.canAutogenerate) {
        throw new BadRequestCustomResponse({
          title: 'Exam cannot be autogenerated',
          key: CustomErrorKeys.EXAM_CANNOT_BE_AUTOGENERATED,
          detail: 'Exam cannot be autogenerated',
        });
      }
      //create the new exam
      const newExam = await this.examsService.generateExam(topics, examType);
      exam = await this.examsService.findOne({
        filterOptions: {
          _id: newExam._id,
        },
        populateOptions: [
          { path: 'configuration', populate: 'groups' },
          'topics',
          'questions',
          'examType',
        ],
      });
      return exam;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  private async generateExamAttempt(exam: Exam, appUserId: AppUser['_id']) {
    try {
      let information: Information = null;
      //first, get the questions
      const questions = await this.generateQuestionsForExamAttempt(exam);
      //then, create the exam attempt status
      const newExamAttemptCreatedStatus =
        await this.examAttemptStatusesService.createExamAttemptStatus({
          value: ExamAttemptStatusEnum.CREATED,
        });

      //finally, for each question, create a new examAttemptQuestion
      const newExamAttemptQuestionsIds = await Promise.all(
        questions.map(async (question) => {
          const newExamAttemptQuestion =
            await this.examAttemptQuestionsService.createExamAttemptQuestion({
              question: question._id,
            });
          return newExamAttemptQuestion._id;
        }),
      );

      //create the exam attempt
      const newExamAttempt = await super.create({
        exam: exam._id,
        appUser: appUserId,
        startTime: new Date(),
        questions: newExamAttemptQuestionsIds,
        statusHistory: [newExamAttemptCreatedStatus._id],
        information: information ? information._id : null,
      });

      //create the exam attempt status pending
      const newExamAttemptInProcessStatus =
        await this.examAttemptStatusesService.createExamAttemptStatus({
          value: ExamAttemptStatusEnum.IN_PROCESS,
        });

      await super.update(newExamAttempt._id, {
        $push: {
          statusHistory: newExamAttemptInProcessStatus._id,
        },
      });
      return newExamAttempt;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * @description This function checks if the user is in the exam groups.
   * @author Damian
   * @date 07/07/2025
   * @param {AppUser} appUser
   * @param {Exam} exam
   * @returns {*}  {boolean}
   * @memberof ExamAttemptsService
   */
  isAppUserInExamGroups(appUser: AppUser, exam: Exam): boolean {
    try {
      //get the exam groups
      const examGroups = exam.configuration.groups;
      //if the exam does not have groups, return true
      if (!examGroups || examGroups.length <= 0) return true;
      //get the user groups
      const userGroups = appUser.userGroups;
      //if the user does not belong to any group, return false
      if (!userGroups || userGroups.length <= 0) return false;

      //check if the user belongs to all the groups that the exam is in
      return examGroups.every((examGroup) =>
        userGroups.some((userGroup) => userGroup.group._id === examGroup._id),
      );
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * @description This function finds the last attempt of the user.
   * @author Damian
   * @date 08/07/2025
   * @param {Exam} exam
   * @param {AppUser['_id']} appUserId
   * @returns {*}  {Promise<ExamAttempt>}
   * @memberof ExamAttemptsService
   */
  async getLastAttemptOfUser(
    exam: Exam,
    appUserId: AppUser['_id'],
  ): Promise<ExamAttempt> {
    try {
      const latestAttempt = await super.findOne({
        filterOptions: {
          appUser: appUserId,
          exam: exam._id,
        },
        sortOptions: { createdAt: -1 },
        populateOptions: [{ path: 'statusHistory', populate: 'status' }],
        triggerError: false,
      });

      return latestAttempt;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * @description This function checks if the user can attempt the exam.
   * @author Damian
   * @date 08/07/2025
   * @private
   * @param {ExamAttempt} latestAttempt
   * @memberof ExamAttemptsService
   */
  private checkIfUserCanAttempt(latestAttempt: ExamAttempt) {
    //if the exam is in process, throw an error
    const { CREATED, IN_PROCESS } = ExamAttemptStatusEnum;
    const notAllowedStatuses = [CREATED, IN_PROCESS] as string[];
    console.log(latestAttempt);
    const lastStatus = getLastArrayItem(latestAttempt.statusHistory);
    console.log('lastStatus', lastStatus);

    if (notAllowedStatuses.includes(lastStatus.status.value)) {
      throw new BadRequestCustomResponse({
        title: 'User already has this exam in process',
        key: CustomErrorKeys.EXAM_ATTEMPT_IN_PROCESS,
        detail: 'User already has this exam in process',
      });
    }
  }

  // const examTopicsIds = exam.topics.map((topic) => topic._id);
  //   const examQuestionsIds = exam.questions.map((question) => question._id);
  //   const questions = await this.questionsService.getRandomQuestions(
  //     examTopicsIds,
  //     exam.configuration.numberOfQuestions - examQuestionsIds.length,
  //     examQuestionsIds,
  //   );
  private async generateQuestionsForExamAttempt(
    exam: Exam,
  ): Promise<Question[]> {
    try {
      //first, get the total of questions that must be generated (exam.configuration.numberOfQuestions - exam questions id / topics.length)
      let totalQuestions = this.getTotalQuestions(exam);
      //then, create an array of selectedQuestions, This array will contain the questions of the exam plus the questions of the topics
      let selectedQuestions: Question[] = exam.questions || [];

      //next, check if the topics have the amount of questions, if not, throw an error
      await this.checkIfTopicsHaveTheAmountOfQuestions(
        exam.topics,
        totalQuestions,
        selectedQuestions.map((q) => q._id),
      );

      //for each topics:
      let topics = exam.topics;
      //get the TopicsWithParents
      const topicsWithParents = await this.examsService.getTopicsToGenerateExam(
        topics.map((topic) => topic._id),
      );

      //if total of questions is more than 0, get the questions count again and repeat the process

      while (totalQuestions > 0) {
        for (let topicsWithParent of topicsWithParents) {
          //   get the questions quota of the topic (total of questions / number of questions)
          let questionsQuota = roundTo(totalQuestions / exam.topics.length);
          //if questionQuota is less than 1, set it to 1
          console.log(questionsQuota < 1);
          if (questionsQuota < 1) questionsQuota = 1;
          //   now get the random questions, getQuestions(id topic, questions quota, selectedQuestions that must be excluded)
          let questions = await this.questionsService.getRandomQuestions(
            [
              topicsWithParent.parent._id,
              ...topicsWithParent.childCategories.map(
                (category) => category._id,
              ),
            ],
            questionsQuota,
            selectedQuestions.map((q) => q._id),
          );
          //if the questions are less than the questions quota, get the questions
          //  add the questions to the selectedQuestions
          selectedQuestions.push(...questions);
          //clear duplicated questions
          selectedQuestions = clearArrayDuplicates(selectedQuestions);
          //subtract the total of questions from the new questions
          totalQuestions = totalQuestions - questions.length;
        }
      }

      //if seletedQuestions has more than the total of questions, reduce the selectedQuestions
      if (selectedQuestions.length > exam.configuration.numberOfQuestions) {
        selectedQuestions = selectedQuestions.slice(
          0,
          exam.configuration.numberOfQuestions,
        );
      }

      return selectedQuestions;
    } catch (e) {
      console.log(e);

      throw e;
    }
  }

  private getTotalQuestions(exam: Exam): number {
    const numberOfQuestionsToGenerate =
      exam.configuration.numberOfQuestions - (exam.questions?.length || 0);

    return roundTo(numberOfQuestionsToGenerate);
  }

  private async checkIfTopicsHaveTheAmountOfQuestions(
    topics: Category[],
    totalQuestions: number,
    alreadySelectedQuestionsIds: Question['_id'][],
  ): Promise<void> {
    try {
      // questionIds of from the already selected ones
      let selectedQuestionsIds = alreadySelectedQuestionsIds;
      //for each topic, get the questions with that topic, excluding the already selected ones
      for (const topic of topics) {
        const storedQuestions = await this.questionsService.findAll(
          {
            filterOptions: {
              _id: {
                $nin: selectedQuestionsIds,
              },
              topics: {
                $in: [topic._id],
              },
            },
          },
          {
            limit: Infinity,
          },
        );
        //push the new questions to the selectedQuestionsIds
        selectedQuestionsIds.push(...storedQuestions.map((q) => q._id));
        //clear the array of duplicates
        selectedQuestionsIds = clearArrayDuplicates(selectedQuestionsIds);
      }
      //if the totalQuestions is more than the selectedQuestionsIds, throw an error,
      // because the topics do not have the amount of questions
      if (totalQuestions > selectedQuestionsIds.length) {
        throw new BadRequestCustomResponse({
          title: 'Topics cannot fill the number of questions',
          key: CustomErrorKeys.TOPICS_CANT_FILL_QUESTIONS,
          detail: 'Topics cannot fill the number of questions',
        });
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  private updateExamAttemptResponse(updatedExamAttempt: ExamAttempt) {
    try {
      const lastStatus = getLastArrayItem(updatedExamAttempt.statusHistory);
      const { FAILED, APPROVED, ABANDONED } = ExamAttemptStatusEnum;
      const allowedStatuses = [FAILED, APPROVED, ABANDONED] as string[];
      const { questions } = updatedExamAttempt;
      const { status } = lastStatus;
      const { value } = status;

      //if the exam is finished, return the score, else only return the status
      if (allowedStatuses.includes(value)) {
        const unansweredQuestions =
          questions.filter(
            (question) => !question.answers || !question.answers[0],
          ).length || 0;

        const correctAnswers =
          questions.filter(
            (question) => question.answers?.[0]?.isCorrect === true,
          ).length || 0;

        const wrongAnswers =
          questions.filter(
            (question) =>
              question.answers?.[0] && question.answers[0].isCorrect === false,
          ).length || 0;

        return {
          _id: updatedExamAttempt._id,
          status: lastStatus.status.value,
          score: updatedExamAttempt.score,
          unansweredQuestions: unansweredQuestions,
          correctAnswers: correctAnswers,
          wrongAnswers: wrongAnswers,
        };
      } else {
        return {
          _id: updatedExamAttempt._id,
          status: lastStatus.status.value,
          score: updatedExamAttempt.score,
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
