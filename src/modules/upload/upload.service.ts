import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import * as fsExtra from 'fs-extra';
import { ImageTypeEnum } from '../images/enums/type-image.enum';
import { CreateImageDto } from '../images/dto/create-image.dto';
import { MulterFile } from '@/shared/interfaces/multer-file.interface';
import sharp from 'sharp';
import path from 'path';

enum Format {
  SVG = '.svg',
  WEBP = '.webp',
}

@Injectable()
export class UploadService {
  private readonly url: string;
  private readonly temporalDirectoryPrefix: string;
  private readonly directory: string;
  private readonly temporalDirectory: string;
  private readonly assetsPreffix: string;

  constructor(
    // private readonly imagesService: ImagesService,
    private readonly configService: ConfigService,
  ) {
    this.temporalDirectoryPrefix = this.configService.get<string>(
      'TEMPORAL_ASSETS_PREFIX',
      '',
    );
    this.assetsPreffix = this.configService.get<string>('ASSETS_PREFIX', '');
    this.url = this.configService.get<string>('ASSETS_URL_BASE', '');
    this.directory = this.configService.get<string>('ASSETS_ROOT_PATH', '');
    this.temporalDirectory = this.configService.get<string>(
      'TEMPORAL_ASSETS_ROOT_PATH',
      '',
    );
  }
  async uploadTempImages(files: MulterFile[]): Promise<string[]> {
    const tempImagePaths: string[] = [];
    console.log(files);
    try {
      if (!files) {
        return tempImagePaths;
      }
      for (const file of files) {
        const timestamp = generateTimestamp();
        const originalNameWithHyphens = normalizeFileName(file.originalname);
        const fileName = `${timestamp}-${originalNameWithHyphens}`;
        const imagePath = `${this.temporalDirectory}/${fileName}`;
        fs.writeFileSync(imagePath, file.buffer);
        const url = `${this.url}${this.temporalDirectoryPrefix}/${fileName}`;
        tempImagePaths.push(url);
      }
      return tempImagePaths;
    } catch (error) {
      console.error(error);
      //TODO: Throw Error here
      return [];
    }
  }

  /**
   * Method to move an image from a temporary directory to a definitive directory.
   * @param tempImagePath Temporary path of the image.
   * @param definitiveDirectory Definitive directory where the image will be moved.
   * @returns Path of the image in the definitive directory.
   */
  async moveImage(
    tempImagePath: string,
    directory: string,
    newFileName: string,
  ): Promise<string> {
    try {
      // Convierte la URL de la imagen temporal en una ruta de archivo local
      const localTempImagePath = tempImagePath.replace(`${this.url}/`, '');
      const definitivePath = `${directory}/${newFileName}`;

      fsExtra.move(localTempImagePath, definitivePath, function (err) {
        if (err) return console.error(err);
      });
      return definitivePath;
    } catch (error) {
      console.error('Error moving image:', error);
      throw new Error('Error moving image');
    }
  }

  /**
   * @description Method to move the images of a product to the definitive directory and save the path in the database.
   * @author Helena Rodríguez
   * @param {*} entityDto
   * @param {*} newEntity
   * @returns {*}  {Promise<Image[]>}
   * @memberof FilesService
   */

  // async moveFilesAndSavePath(
  //   entityDto: any,
  //   newEntity: any,
  // ): Promise<Image[] | null> {
  //   try {
  //     const newImages: any[] = [];

  //     if (!entityDto.images || entityDto.images.length === 0) {
  //       // No hay imágenes, añadir la imagen por defecto
  //       const defaultImage = await this.imagesService.create({
  //         name: 'default_image',
  //         alt: newEntity.name,
  //         url: `${this.url}/${this.directory}/default_image.png`,
  //         imageType: ImageTypeEnum.FALLBACK,
  //       });
  //       newImages.push(defaultImage);
  //     } else {
  //       for (const image of entityDto.images) {
  //         // obtener el nombre original del archivo
  //         let originalFileName = image.url.substring(
  //           image.url.lastIndexOf('/') + 1,
  //         );

  //         // Cambiar el nombre del archivo
  //         // Extraer la extensión del archivo
  //         const fileExtension = originalFileName.substring(
  //           originalFileName.lastIndexOf('.'),
  //         );

  //         // Cambiar el nombre del archivo, incluyendo la extensión
  //         const normalizeEntityName = normalizeFileName(newEntity.name);
  //         const newFileName = `${newEntity.uuid}-${newEntity.imageType}-${normalizeEntityName}${fileExtension}`;
  //         console.log(image.url, this.assetsPreffix, newFileName);
  //         // Mover la imagen al directorio definitivo
  //         const definitivePath = await this.moveImage(
  //           image.url,
  //           this.directory,
  //           newFileName,
  //         );

  //         const absolutePath = `${this.url}${this.assetsPreffix}/${newFileName}`;

  //         // Guardar la imagen en la base de datos
  //         const newImage = await this.imagesService.create({
  //           name: newFileName,
  //           alt: newEntity.name,
  //           url: absolutePath,
  //           imageType: newEntity.imageType
  //             ? newEntity.imageType
  //             : ImageTypeEnum.MAIN,
  //         });
  //         newImages.push(newImage);
  //       }
  //     }
  //     return newImages;
  //   } catch (error) {
  //     console.log(error);
  //     return null;
  //     //TODO: Send error here
  //   }
  // }
  async saveFiles(files: MulterFile[]): Promise<string[]> {
    const tempImagePaths: string[] = [];
    try {
      if (!files) {
        return tempImagePaths;
      }
      for (const file of files) {
        const timestamp = generateTimestamp();
        const originalNameWithHyphens = normalizeFileName(file.originalname);
        const fileName = `${timestamp}-${originalNameWithHyphens}`;
        const imagePath = `${this.directory}/${fileName}`;
        fs.writeFileSync(imagePath, file.buffer);
        const url = `${this.url}${this.assetsPreffix}/${fileName}`;
        tempImagePaths.push(url);
      }
      return tempImagePaths;
    } catch (error) {
      console.error(error);
      //TODO: Throw Error here
      return [];
    }
  }

  async createImgsArray(files: {
    [images: string]: Express.Multer.File[];
  }): Promise<CreateImageDto[]> {
    const images: CreateImageDto[] = [];
    let imgTypes = [];
    try {
      if (!files.images || files.images.length <= 0) {
        return images;
      }
      for (const file of files.images) {
        const imgType = validateImageType(file.originalname, imgTypes);
        imgTypes.push(imgType);
        const timestamp = generateTimestamp();
        const originalNameWithHyphens = normalizeFileName(file.originalname);
        const fileName = `${timestamp}-${originalNameWithHyphens}`;
        const imagePath = `${this.directory}/${fileName}`;
        fs.writeFileSync(imagePath, file.buffer);
        const url = `${this.url}${this.assetsPreffix}/${fileName}`;

        await this.optimizeImage(
          file,
          fileName,
          1000,
        );

        images.push({
          url: url,
          alt: originalNameWithHyphens,
          imageType: imgType,
        });
      }
      console.log(images);
      return images;
    } catch (error) {
      console.error(error);
      //TODO: Throw Error here
      return [];
    }
  }
  async optimizeImage(
    image: Express.Multer.File,
    fileName: string,
    width?: number,
  ) {
    const fileLocation = `assets/images/${fileName}`;
    const extension = path.extname(image.originalname).toLowerCase(); // Obtenemos la extención
    const { SVG, WEBP } = Format;

    const isSvg = extension === SVG; // Variable donde se guarda la condición
    const format = isSvg ? SVG : WEBP; // Selector de la extensión en función de la condición

    // Quitamos la extención y el tipo "logo"
    fileName = fileName.slice(0, -extension.length).replace(/logo_/i, "");

    const imageName = `${fileName}${format}`; // Renombramos la imagen
    const imageNewPath = path.join('assets/images', imageName); // Definimos el directorio donde se guardará

    if (isSvg) {
      // Copiamos directamente el archivo sin procesar
      fs.copyFileSync(fileLocation, imageNewPath);
    } else {
      // Procesamos la imagen con sharp
      await sharp(image.buffer)
        .resize({ width }) // Redimensionamos
        .webp({ quality: 80 }) // Comprimimos a webp
        .toFile(imageNewPath);
    }

    // Elimina el archivo original
    fs.unlinkSync(fileLocation);

    return imageNewPath;
  }
}

export function normalizeFileName(fileName: string): string {
  // Replace spaces with hyphens and convert to lowercase
  return fileName.replace(/\s+/g, '-').toLowerCase();
}
export function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Función para verificar si el tipo de imagen es válido
export function validateImageType(
  fileName: string,
  imgTypes: string[],
): string {
  // Extraemos el tipo de imagen (por ejemplo, "AVATAR", "LOGO")
  let imgType = fileName.split('_')[0].toUpperCase();
  // Verificamos si el tipo de imagen está en el enum
  if (!Object.values(ImageTypeEnum).includes(imgType as ImageTypeEnum)) {
    throw new Error(`Tipo de imagen '${imgType}' no es válido.`);
  }
  const imgTypeExists = imgTypes.includes(imgType as ImageTypeEnum);
  if (imgTypeExists) {
    imgType = `${imgType}_${imgType.split('_')[1] + 1 || 1}`;
  }

  return imgType;
}
