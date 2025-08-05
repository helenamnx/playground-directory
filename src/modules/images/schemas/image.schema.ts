//  image.schema.ts
import { Thing } from '@/shared/schemas/thing.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ImageTypeEnum } from '../enums/type-image.enum';

/**
 * @description
 * @author Helena Rodríguez
 * @date 13/03/2024
 * @export
 * @class Image
 * @extends {Thing}
 */
@Schema()
export class Image extends Thing {
  @Prop({ required: true })
  alt: string;

  @Prop({ required: true })
  url: string;

  @Prop({
    required: true,
    type: String,
    default: ImageTypeEnum.MAIN,
  })
  imageType: string;
}
export const ImageSchema = SchemaFactory.createForClass(Image);
ImageSchema.remove('images');
