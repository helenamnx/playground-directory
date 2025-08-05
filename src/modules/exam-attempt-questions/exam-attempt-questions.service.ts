import { Injectable } from '@nestjs/common';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { ExamAttemptQuestion } from '../exam-attempt-questions/schemas/exam-attempt-answer.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuestionsService } from '../questions/questions.service';
import { AnswerOptionsService } from '../answer-options/answer-options.service';
import { AnswerOption } from '../answer-options/schemas/answer-option.entity';
import { CreateExamAttemptQuestionDto } from './dto/create-exam-attempt-question.dto';
@Injectable()
export class ExamAttemptQuestionsService extends CRUDService<ExamAttemptQuestion> {
  constructor(
    @InjectModel(ExamAttemptQuestion.name)
    examAttemptQuestion: Model<ExamAttemptQuestion>,
    private readonly answerOptionService: AnswerOptionsService,
    private readonly questionService: QuestionsService,
  ) {
    super(examAttemptQuestion);
  }

  async createExamAttemptQuestion(
    createExamAttemptQuestionDto: CreateExamAttemptQuestionDto,
  ) {
    try {
      const { answers, question } = createExamAttemptQuestionDto;

      //check if the question exists
      const storedQuestion = await this.questionService.findOneById({
        id: question,
      });
      let answersId: AnswerOption['_id'][] = [];
      if (answers) {
        answersId = await Promise.all(
          answers.map(async (answerId) => {
            const storedAnswerOption =
              await this.answerOptionService.findOneById(answerId);
            return storedAnswerOption._id;
          }),
        );
      }
      const newExamAttemptQuestion = await super.create({
        answers: answersId,
        question: storedQuestion._id,
      });
      return newExamAttemptQuestion;
    } catch (error) {
      throw error;
    }
  }
}
