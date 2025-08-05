import { Module } from '@nestjs/common';
import { QuestionConfigurationsController } from './question-configurations.controller';
import { QuestionConfigurationsService } from './question-configurations.service';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionConfiguration, QuestionConfigurationSchema } from './schemas/question-configuration.schema';

@Module({
  imports: [
    // Import any necessary modules here, such as MongooseModule for MongoDB integration
    MongooseModule.forFeature([{ name: QuestionConfiguration.name, schema: QuestionConfigurationSchema }]),
  ],
  controllers: [QuestionConfigurationsController],
  providers: [QuestionConfigurationsService],
  exports: [QuestionConfigurationsService],
})
export class QuestionConfigurationsModule { }
