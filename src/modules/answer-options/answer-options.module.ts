import { Module } from '@nestjs/common';
import { AnswerOptionsService } from './answer-options.service';
import { AnswerOptionsController } from './answer-options.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AnswerOption, AnswerOptionSchema } from './schemas/answer-option.entity';

@Module({
  imports: [
    // Import any necessary modules here, such as MongooseModule for MongoDB integration
    MongooseModule.forFeature([{ name: AnswerOption.name, schema: AnswerOptionSchema }]),
  ],
  controllers: [AnswerOptionsController],
  providers: [AnswerOptionsService],
  exports: [AnswerOptionsService],
})
export class AnswerOptionsModule { }
