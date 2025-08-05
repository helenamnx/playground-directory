import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContactPointsService } from './contact-points.service';
import { CreateContactPointDto } from './dto/create-contact-point.dto';
import { UpdateContactPointDto } from './dto/update-contact-point.dto';

@Controller('contact-points')
export class ContactPointsController {
  constructor(private readonly contactPointsService: ContactPointsService) { }


}
