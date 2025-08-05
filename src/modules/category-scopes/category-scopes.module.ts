import { Module } from '@nestjs/common';
import { CategoryScopesService } from './category-scopes.service';
import { CategoryScopesController } from './category-scopes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CategoryScope,
  CategoryScopeSchema,
} from './schemas/category-scope.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CategoryScope.name, schema: CategoryScopeSchema },
    ]),
  ],
  controllers: [CategoryScopesController],
  providers: [CategoryScopesService],
  exports: [CategoryScopesService],
})
export class CategoryScopesModule {}
