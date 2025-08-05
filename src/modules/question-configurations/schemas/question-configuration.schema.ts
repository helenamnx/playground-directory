import { Configuration } from '@/shared/schemas/configuration.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class QuestionConfiguration extends Configuration {
  /**
   * Indicates whether the question is auto-graded.
   * If true, the system will automatically grade the question based on the provided answer options.
   */
  @Prop({ type: Number, default: 0.33 })
  negativeMarking: number;

  /**
   * Indicates whether the question allows partial marking.
   * If true, students can receive partial credit for partially correct answers.
   */
  @Prop({ type: Boolean, default: false })
  partialMarking: boolean;

  /**
   * Indicates whether the question is timed.
   * If true, the `timeLimit` property should be set to specify the time limit in seconds.
   */
  @Prop({ type: Boolean, default: false })
  timed: boolean;

  /**
   * The time limit for the question in seconds.
   * This is only applicable if `timed` is set to true.
   */
  @Prop({ type: Number })
  timeLimit: number;

  @Prop({ type: Number, default: 1 })
  weight: number;

  /**
   * Roles that can access this question configuration.
   * This is a comma-separated string of role names.
   */
  //TODO: Change to references to a Role entity
  @Prop({ type: [String], default: [] })
  roles?: string[];
}
export const QuestionConfigurationSchema = SchemaFactory.createForClass(
  QuestionConfiguration,
);
