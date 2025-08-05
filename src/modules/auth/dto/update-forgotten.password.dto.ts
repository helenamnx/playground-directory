//create-user.dto.ts
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateForgottenPassword {
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  securityCodeId: string;
}

export class UpdateUserPassword {
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  appUserId: string;

  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean;
}
