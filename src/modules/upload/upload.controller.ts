import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { Request } from 'express';
import { diskStorage } from 'multer';
import { SingleFileDto } from './dto/single-file.dto';
import { MultipleFileDto } from './dto/multiple-files.dto';
import { fileMapper, filesMapper } from './utils/file-mapper';
import { editFileName, imageFileFilter } from './utils/file-upload.util';
import { UploadService } from './upload.service';
import { FastifyFileInterceptor } from '@/shared/interceptors/fastify-file.interceptor';
import { FastifyFilesInterceptor } from '@/shared/interceptors/fastify-files.interceptor';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // //TODO: single file has an error on the file variable (undefined)
  // @Post('single-file')
  // @UseInterceptors(
  //   FastifyFilesInterceptor([{ name: 'photo_url', maxCount: 5 }]),
  // )
  // single(
  //   @Req() req: Request,
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() body: SingleFileDto,
  // ) {
  //   return { ...body, photo_url: fileMapper({ file, req }) };
  // }

  // @Post('temporal')
  // @UseInterceptors(
  //   FastifyFilesInterceptor([{ name: 'photo_url', maxCount: 5 }]),
  // )
  // async uploadTempImages(@Req() request: any): Promise<string[]> {
  //   const files = request.files; // Aquí está el archivo procesado

  //   return this.uploadService.uploadTempImages(files);
  // }

  // @Post('files')
  // @UseInterceptors(
  //   FastifyFilesInterceptor([{ name: 'photo_url', maxCount: 5 }]),
  // )
  // multiple(
  //   @Req() req: Request,
  //   @UploadedFiles() files: Express.Multer.File[],
  //   @Body() body: MultipleFileDto,
  // ) {
  //   const uploadedFiles = await this.uploadService.saveFiles(files);
  //   return uploadedFiles;
  // }
}
