import { HttpRequestService } from '@/shared/http-request/http-request.service';
import { Injectable } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { CustomErrorResponse } from '@/shared/responses/error/custom-error-response.class';

@Injectable()
export class EmailsService {
  private request = this.httpService.getHttpRequestMethods();
  constructor(private readonly httpService: HttpRequestService) {}
  async create(createEmailDto: CreateEmailDto) {
    //TODO: Add history, actions and logger
    //TODO: return the result
    try {
      const { platform } = createEmailDto;

      await this.request.POST({
        endpoint: `${platform.baseURL}/emails/send`, //TODO: change url
      });
      return { message: 'Email sent' };
    } catch (e) {
      console.log(e);
      throw new CustomErrorResponse(e.response.data);
    }
  }

  sendEmail(createEmailDto: CreateEmailDto) {
    try {
      const { platform } = createEmailDto;
      this.request.POST({
        endpoint: `${platform.baseURL}/emails/send`, //TODO: change url
        data: createEmailDto,
      });
      return { message: 'Email sent' };
    } catch (e) {
      console.log(e);
      throw new CustomErrorResponse(e);
    }
  }
}
