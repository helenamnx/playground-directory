import { Category } from '@/modules/categories/schemas/category.schema';

export interface TopicsWithParent {
  parent: Category;
  childCategories: Category[];
}
