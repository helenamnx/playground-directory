import { Injectable } from '@nestjs/common';
import { HttpRequestService } from '../../shared/http-request/http-request.service';
import { ServicesService } from './services.service';
import { CustomErrorResponse } from 'src/shared/responses/error/custom-error-response.class';
import { NotFoundCustomResponse } from 'src/shared/responses/error/custom-error-response';
import { CustomErrorKeys } from 'src/shared/enums/error-keys.enum';
import { sendEmailMock } from '@/shared/mocks/send-email.mock';

@Injectable()
export class SendEmailsService {
  private request = this.httpService.getHttpRequestMethods();
  constructor(
    private readonly httpService: HttpRequestService,
    private readonly servicesService: ServicesService,
  ) {}
  //TODO: add dto

  async sendEmail(emailTosend: any) {
    const servicesService = await this.servicesService.findAll({});
    const emailService = servicesService.find(
      (service) => service.alias === 'email-microservice',
    );
    if (!emailService) {
      throw new NotFoundCustomResponse({
        title: 'Email service not found',
        detail: 'Email service not found',
        key: CustomErrorKeys.EMAIL_MICROSERVICE_NOT_FOUND,
      });
    }
    try {
      const emailSended = await this.request.POST({
        endpoint: `${emailService.baseURL}/emails/send`,
        headers: {
          'client-token': 'messages-microservice',
        },
        data: sendEmailMock,
      });
      return { message: 'Email sent' };
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }
}
