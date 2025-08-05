import { CategoryScope } from '@/modules/category-scopes/schemas/category-scope.schema';
import { Thing } from '@/shared/schemas/thing.schema';
import { LanguageMapType } from '@/shared/types/language-map.type';
import { Tag } from '@/tags/entities/tag.entity';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Category extends Thing {
  /**
   * This code is used to uniquely identify the category.
   */
  @Prop({ type: String, required: true, unique: true })
  code: string;

  /**
   * This attribute represents the value of the category.
   * Example: "Jurisdicción"
   */
  @Prop({ type: String, required: true, unique: true })
  value: string;

  /**
   * This array contains references to parent categories.
   */
  @Prop({ type: [{ type: String, ref: 'Category' }] })
  parentCategories: Category[];

  /**
   * This scope is used to define the context in which the category is used.
   */
  @Prop({ type: String, ref: 'CategoryScope' })
  scope: CategoryScope;

  /**
   *{
   * type: "scope Category",
   * languageMap: {
   * "es: "Categoría de ámbito",
   *  "en": "Scope Category"
   * }
   * }
   * }
   */

  //this attribute is used to check if the category is active
  @Prop({ type: Boolean })
  isActive: boolean;

  //this attribute represents the title of the category
  @Prop({
    type: Object,
  })
  title: LanguageMapType;

  // @Prop({ type: [{ type: String, ref: 'Tag' }] })
  // tags: Tag[];

  //this attribute is used to generate the slug of the category
  @Prop({
    type: Object,
  })
  slug: LanguageMapType;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
