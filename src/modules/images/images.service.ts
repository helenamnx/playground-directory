import { Injectable } from '@nestjs/common';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { Image } from './schemas/image.schema';
import { Model } from 'mongoose';
import { CustomErrorResponse } from '@/shared/responses/error/custom-error-response.class';
import { UploadService } from '../upload/upload.service';
import { ImageTypeEnum } from './enums/type-image.enum';
import { CreateImageDto } from './dto/create-image.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImagesService extends CRUDService<Image> {
  private readonly url: string;
  private readonly assetsPreffix: string;
  private defaultImagePath: string;

  constructor(
    @InjectModel(Image.name) private imageModel: Model<Image>,
    private readonly uploadFilesService: UploadService,
    private readonly configService: ConfigService,
  ) {
    super(imageModel);
    this.assetsPreffix = this.configService.get<string>('ASSETS_PREFIX', '');
    this.url = this.configService.get<string>('ASSETS_URL_BASE', '');
    this.defaultImagePath = this.configService.get<string>(
      'DEFAULT_IMAGE_ASSETS',
      '',
    );
  }

  async createImages(images: CreateImageDto[]) {
    try {
      const newImages = await Promise.all(
        images.map(async (image) => {
          const newImage = await super.create(image);
          return newImage._id;
        }),
      );
      if (images.length <= 0) {
        const url = `${this.url}${this.defaultImagePath}/default-image.png`;

        const defaultImage = await super.create({
          alt: 'default-image',
          url: url,
          imageType: ImageTypeEnum.FALLBACK,
        });
        newImages.push(defaultImage._id);
      }
      return newImages;
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  async createMany(images: any) {
    const allImageIds: string[] = [];

    for (const [key, imageArray] of Object.entries(images)) {
      const uploadedUrls = await this.uploadFilesService.saveFiles(
        imageArray as any,
      );

      const imageIds = await Promise.all(
        uploadedUrls.map(async (url) => {
          const image = await super.create({
            alt: 'generate alt',
            url,
            imageType: ImageTypeEnum.MAIN, //TODO: change type
          });
          return image._id;
        }),
      );

      allImageIds.push(...imageIds);
    }
    return allImageIds;
  }
}
