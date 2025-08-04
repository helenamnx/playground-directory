import { Injectable } from '@nestjs/common';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '@/modules/users/users.service';
import { Subscription } from './schemas/subscription.schema';

@Injectable()
export class SubscriptionsService extends CRUDService<Subscription> {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    private readonly usersService: UsersService,
  ) {
    super(subscriptionModel);
  }

  async createSubscription(createSubscriptionDto: any): Promise<any> {
    try {
      const { userId, subscription } = createSubscriptionDto;

      // Check if the subscription already exists
      const existingSubscription = await super.findOne({
        filterOptions: { endpoint: subscription.endpoint, owner: userId },
        triggerError: false,
      });
      if (existingSubscription) {
        return {
          message: 'La suscripción ya está registrada para este usuario.',
        };
      }

      // Create a new subscription
      const newSubscription = await super.create({
        owner: userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      });
      return {
        message: 'Suscripción registrada exitosamente.',
        subscription: newSubscription,
      };
    } catch (error) {
      console.log('Error saving subscription', error);
      return { message: 'Error saving subscription' };
    }
  }

  async removeSubscription(removeSubscriptionDto: any): Promise<any> {
    try {
      const { userId, subscriptionId } = removeSubscriptionDto;

      // Check if the subscription exists
      const subscription = await super.findOne({
        filterOptions: { _id: subscriptionId, owner: userId },
      });

      await super.remove(subscription._id);

      return { message: 'Subscription removed successfully' };
    } catch (error) {
      //this.logger.error('Error removing subscription', error);
      return { message: 'Error removing subscription' };
    }
  }
}
