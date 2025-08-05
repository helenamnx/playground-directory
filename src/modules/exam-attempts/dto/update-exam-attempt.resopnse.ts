// exam-attempt-result.dto.ts
import { ExamAttemptQuestion } from '@/modules/exam-attempt-questions/schemas/exam-attempt-answer.schema';
import { Expose, Transform } from 'class-transformer';

export class ExamAttemptResultDto {
  @Expose()
  _id: string;

  @Expose()
  status: string;

  @Expose()
  score: number;

  @Expose()
  @Transform(
    ({ obj }) =>
      obj.questions?.filter((q: ExamAttemptQuestion) => !q.answers).length,
  )
  unansweredQuestions?: number;

  @Expose()
  @Transform(
    ({ obj }) =>
      obj.questions?.filter(
        (q: ExamAttemptQuestion) => q.answers?.[0]?.isCorrect,
      ).length,
  )
  correctAnswers?: number;

  @Expose()
  @Transform(
    ({ obj }) =>
      obj.questions?.filter(
        (q: ExamAttemptQuestion) => q.answers && !q.answers[0]?.isCorrect,
      ).length,
  )
  wrongAnswers?: number;
}
