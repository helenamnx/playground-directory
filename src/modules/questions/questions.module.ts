import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './schemas/question.schema';
import { InformationModule } from '../information/information.module';
import { AnswerOptionsModule } from '../answer-options/answer-options.module';
import { CategoriesModule } from '../categories/categories.module';
import { QuestionConfigurationsModule } from '../question-configurations/question-configurations.module';

@Module({
  imports: [
    // Import any necessary modules here, such as MongooseModule for MongoDB integration
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
    InformationModule,
    AnswerOptionsModule,
    CategoriesModule,
    QuestionConfigurationsModule,
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
