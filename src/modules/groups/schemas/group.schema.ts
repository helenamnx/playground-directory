import { Category } from '@/modules/categories/schemas/category.schema';
import { ExamConfiguration } from '@/modules/exam-configurations/schemas/exam-configuration.schema';
import { ExamType } from '@/modules/exam-types/schemas/exam-type.schema';
import { GroupConfiguration } from '@/modules/group-configurations/schemas/group-configuration.schema';
import { Information } from '@/modules/information/schema/information.schema';
import { Question } from '@/modules/questions/schemas/question.schema';
import { Thing } from '@/shared/schemas/thing.schema';
import { LanguageMapType } from '@/shared/types/language-map.type';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Group extends Thing {
  //the type of the group. Ex: "course","userGroup"
  @Prop({ type: String, required: true })
  type: string;

  //the value of the group. Ex: "2025 uoapp socios"
  @Prop({ type: String, required: true })
  value: string;

  @Prop({ type: String, ref: 'GroupConfiguration', required: true })
  configuration: GroupConfiguration;

  //the language map of the group name
  @Prop({ type: Object, required: true })
  name: LanguageMapType;
}
export const GroupSchema = SchemaFactory.createForClass(Group);
