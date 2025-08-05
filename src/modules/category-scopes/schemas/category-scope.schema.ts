import { Thing } from '@/shared/schemas/thing.schema';
import { LanguageMap, LanguageMapType } from '@/shared/types/language-map.type';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CategoryScope extends Thing {
  /**
   * This alias is used to uniquely identify the category.
   */
  @Prop({ type: String, required: true, unique: true })
  alias: string;

  @Prop({ type: Object, required: true })
  languageMap: LanguageMapType;
}

export const CategoryScopeSchema = SchemaFactory.createForClass(CategoryScope);
