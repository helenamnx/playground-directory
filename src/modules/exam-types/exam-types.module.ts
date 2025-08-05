import { Module } from '@nestjs/common';
import { ExamTypesService } from './exam-types.service';
import { ExamTypesController } from './exam-types.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamType, ExamTypeSchema } from './schemas/exam-type.schema';
import { ExamConfigurationsModule } from '../exam-configurations/exam-configurations.module';
import { CategoryScopesModule } from '../category-scopes/category-scopes.module';

@Module({
  imports: [
    CategoryScopesModule,
    ExamConfigurationsModule,
    MongooseModule.forFeature([
      { name: ExamType.name, schema: ExamTypeSchema },
    ]),
  ],
  controllers: [ExamTypesController],
  providers: [ExamTypesService],
  exports: [ExamTypesService],
})
export class ExamTypesModule {}
