import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionService: SubscriptionsService) {}

  @Post('subscribe')
  async saveSubscription(@Body() body: any) {
    return this.subscriptionService.createSubscription(body);
  }

  @Post('unsubscribe')
  async removeSubscription(@Body() body: any) {
    return this.subscriptionService.removeSubscription(body);
  }
}
