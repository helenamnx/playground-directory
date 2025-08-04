//create-user.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  userCredential: string; //Username o email
}
