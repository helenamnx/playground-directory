import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendContactEmailDto } from './dto/send-contact-email.dto';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import { Roles } from '@/shared/decorators/user-scopes.decorator';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { UserTokenGuard } from '@/shared/guards/user-token.guard';
import { BadRequestCustomResponse } from '@/shared/responses/error/custom-error-response';
import { FilesInterceptor, File } from '@nest-lab/fastify-multer';
import { SendLegalEmailDto } from './dto/send-legal-email.dto';
import { JsonFetcherService } from '@/shared/services/json-fetcher/json-fetcher.service';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly alsService: AsyncStorageService,
    private readonly jsonFetcherService: JsonFetcherService,
  ) {}

  @Get('contact-points')
  getContactPoints() {
    return this.jsonFetcherService.fetchLegalContactPoints();
  }

  @Post('contact')
  async sendContactEmail(@Body() sendContactEmailDto: SendContactEmailDto) {
    const client = this.alsService.get(AlsKeysEnum.CLIENT);

    await this.messagesService.sendContactEmail(sendContactEmailDto, client);
    return { message: 'Contact email sent successfully' };
  }

  @UseGuards(UserTokenGuard)
  @Post('contact/legal')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      fileFilter: (req, file, cb) => {
        const allowedTypes = /\/(pdf|png|jpg|jpeg|webp)$/;
        if (allowedTypes.test(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Invalid file type: ${file.originalname}. Allowed types: pdf, png, jpg, jpeg, webp.`,
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB por archivo, opcional
      },
    }),
  )
  async sendLegalEmail(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() sendLegalEmailDto: SendLegalEmailDto,
  ) {
    const client = this.alsService.get(AlsKeysEnum.CLIENT);
    const appUser = this.alsService.get(AlsKeysEnum.APP_USER);
    await this.messagesService.sendLegalContactEmail({
      files: files,
      dto: sendLegalEmailDto,
      appUser: appUser,
      client: client,
    });

    return { message: 'Legal contact email sent successfully' };
  }
}
