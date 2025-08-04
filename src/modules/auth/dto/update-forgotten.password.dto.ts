//create-user.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateForgottenPassword {
  @IsNotEmpty()
  newPassword: string; //Username o password

  @IsString()
  @IsNotEmpty()
  securityCodeId: string; //Username o password
}
