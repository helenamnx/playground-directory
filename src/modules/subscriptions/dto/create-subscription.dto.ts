import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  endpoint: string;

  @IsNotEmpty()
  keys: {
    auth: string;
    p256dh: string;
  };
}
