import { IsNotEmpty, IsOptional, IsEmail, IsString } from 'class-validator';

export class RegisterAppUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  //   @IsOptional()
  //   @IsArray()
  //   contactPoints?: string[];

  //   @IsOptional()
  //   @IsArray()
  //   postalAddresses?: string[];
}
