import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostalAddressesService } from './postal-addresses.service';
import { CreatePostalAddressDto } from './dto/create-postal-address.dto';
import { UpdatePostalAddressDto } from './dto/update-postal-address.dto';

@Controller('postal-addresses')
export class PostalAddressesController {
  constructor(private readonly postalAddressesService: PostalAddressesService) { }




}
