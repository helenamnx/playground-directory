import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InformationContent } from 'src/modules/information-content/schema/information-content.schema';
import { Thing } from 'src/shared/schemas/thing.schema';

@Schema()
export class Information extends Thing {
  /**
   * The author of the information.
   * Can be any type, typically an object representing the author.
   */
  @Prop({ type: String })
  author: any;

  /**
   * The alias or alternative name for the information.
   * Represents a short or alternative name for the information.
   */
  @Prop({ type: String })
  alias: string;

  /**
   * List of translations for the information.
   * Each translation represents the information in a different language.
   */
  @Prop({ type: String, ref: 'InformationContent' })
  content: InformationContent;
}

export const InformationSchema = SchemaFactory.createForClass(Information);
