import { LanguageMapType } from '@/shared/types/language-map.type';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Thing } from 'src/shared/schemas/thing.schema';

@Schema()
export class Status extends Thing {
  //this attribute represents the title of the status
  @Prop({ type: Object, required: true })
  title: LanguageMapType;

  //this attribute represents the value of the status
  @Prop({ type: String, required: true })
  value: string;
}
export const StatusSchema = SchemaFactory.createForClass(Status);
