import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Thing } from 'src/shared/schemas/thing.schema';
import mongoose from 'mongoose';
@Schema()
export class InformationContent extends Thing {
  /**
   * The title of the translation.
   * Represents the main heading or title in the specified language.
   */
  @Prop({
    type: mongoose.Schema.Types.Mixed,
  })
  title: string | Map<string, string>;

  /**
   * The subtitle of the translation.
   * Represents the secondary heading or subtitle in the specified language.
   */
  @Prop({
    type: mongoose.Schema.Types.Mixed,
  })
  subtitle: string | Map<string, string>;

  /**
   * The body of the translation.
   * Represents the main content or body text in the specified language.
   */
  @Prop({
    type: mongoose.Schema.Types.Mixed,
  })
  body: string | Map<string, string>;

  /**
   * The slug of the translation.
   * Represents a URL-friendly version of the title, typically used in routing.
   */
  @Prop({
    type: mongoose.Schema.Types.Mixed,
  })
  slug: string | Map<string, string>;
}
export const InformationContentSchema =
  SchemaFactory.createForClass(InformationContent);
