import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Thing } from 'src/shared/schemas/thing.schema';
import mongoose from 'mongoose';
import { LanguageMapType } from '@/shared/types/language-map.type';
@Schema()
export class InformationContent extends Thing {
  /**
   * The title of the translation.
   * Represents the main heading or title in the specified language.
   */
  @Prop({
    type: mongoose.Schema.Types.Mixed,
  })
  title: string | LanguageMapType;

  /**
   * The subtitle of the translation.
   * Represents the secondary heading or subtitle in the specified language.
   */
  @Prop({
    type: mongoose.Schema.Types.Mixed,
  })
  subtitle: string | LanguageMapType;

  /**
   * The body of the translation.
   * Represents the main content or body text in the specified language.
   */
  @Prop({
    type: mongoose.Schema.Types.Mixed,
  })
  body: string | LanguageMapType;

  /**
   * The slug of the translation.
   * Represents a URL-friendly version of the title, typically used in routing.
   */
  @Prop({
    type: mongoose.Schema.Types.Mixed,
  })
  slug: string | LanguageMapType;
}
export const InformationContentSchema =
  SchemaFactory.createForClass(InformationContent);
