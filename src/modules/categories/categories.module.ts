import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { CategoryScopesModule } from '../category-scopes/category-scopes.module';

@Module({
  imports: [
    // Import any necessary modules here, such as MongooseModule for MongoDB integration
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    CategoryScopesModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService, MongooseModule],
})
export class CategoriesModule {}
