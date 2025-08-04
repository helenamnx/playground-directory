import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  credential: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}
