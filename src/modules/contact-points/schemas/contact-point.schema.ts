import { Thing } from '@/shared/schemas/thing.schema';
import { LanguageMapType } from '@/shared/types/language-map.type';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class ContactPoint extends Thing {
  //the name of the contact point
  @Prop({ type: Object, required: false })
  name: LanguageMapType;

  /**
   *  Type of the contact point (required).
   */
  @Prop({ required: true })
  type: string;

  /**
   * Value of the contact point (required).
   */
  @Prop({ required: true })
  value: string;
  /**
   * This boolean check if the contact point is visible to all the users or not.
   * For example, if the contact point is visible, all users may see the contact point in the app
   * else, it will be only visible to the owner of the contact point.
   */
  @Prop({ type: Boolean, default: false })
  isVisible: boolean;
}

export const ContactPointSchema = SchemaFactory.createForClass(ContactPoint);
