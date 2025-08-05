import { PartialType } from '@nestjs/mapped-types';
import { CreatePostalAddressDto } from './create-postal-address.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePostalAddressDto extends PartialType(
  CreatePostalAddressDto,
) {
  @IsString()
  @IsNotEmpty()
  _id: string;
}
