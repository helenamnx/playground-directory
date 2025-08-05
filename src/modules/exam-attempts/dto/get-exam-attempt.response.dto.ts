import { Expose, Transform, Type } from 'class-transformer';

function shuffleArray<T>(arr: T[]): T[] {
  return arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

class AnswerOptionDto {
  @Expose() _id: string;
  @Expose() value: string;
}

class ContentDto {
  @Expose() _id: string;
  @Expose() title: string;
}

class InformationDto {
  @Expose() _id: string;
  @Expose() author: string;

  @Expose()
  @Type(() => ContentDto)
  content: ContentDto;
}

class TopicDto {
  @Expose() _id: string;
  @Expose() title: string;
}

class ConfigurationDto {
  @Expose() isActive: boolean;
  @Expose() isVisible: boolean;
  @Expose() timed: boolean;
  @Expose() timeLimit: number | null;
}

class QuestionDto {
  @Expose() _id: string;
  @Expose() difficulty: string;
  @Expose() observations: string;
  @Expose() version: number;

  @Expose()
  @Type(() => InformationDto)
  information: InformationDto;

  @Expose()
  @Type(() => TopicDto)
  topics: TopicDto[];

  @Expose()
  @Type(() => ConfigurationDto)
  configuration: ConfigurationDto;

  @Expose()
  @Transform(({ value }) => shuffleArray(value))
  @Type(() => AnswerOptionDto)
  answerOptions: AnswerOptionDto[];
}

class ExamQuestionDto {
  @Expose() _id: string;

  @Expose()
  @Type(() => QuestionDto)
  question: QuestionDto;

  @Expose() answers: any[]; // adapta si necesitas un tipo concreto
}

class StatusTitleDto {
  @Expose() type: string;

  @Expose() languageMap: Record<string, string>;
}

class StatusDto {
  @Expose() _id: string;
  @Expose()
  @Type(() => StatusTitleDto)
  title: StatusTitleDto;
  @Expose() value: string;
}

class StatusHistoryDto {
  @Expose() _id: string;
  @Expose() status: StatusDto;
  @Expose() history: any[];
}

export class ExamResponseDto {
  @Expose() _id: string;
  @Expose() score: number;

  @Expose()
  @Type(() => ExamQuestionDto)
  questions: ExamQuestionDto[];

  @Expose()
  @Type(() => StatusHistoryDto)
  statusHistory: StatusHistoryDto;

  @Expose() startTime: string;

  // Para simplificar el nested exam info:
  @Expose() exam: any;
  @Expose() createdAt: string;
  @Expose() updatedAt: string;
  @Expose() duration: number | null;
}
