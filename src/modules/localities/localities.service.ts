import { Injectable } from '@nestjs/common';
import { CreateLocalityDto } from './dto/create-locality.dto';
import { UpdateLocalityDto } from './dto/update-locality.dto';
import { Locality } from './schemas/locality.schema';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { transform } from '@swc/core';
import { transformToLanguageMapType } from '@/shared/utils/utils';

@Injectable()
export class LocalitiesService extends CRUDService<Locality> {
  constructor(
    @InjectModel(Locality.name) private localityModel: Model<Locality>,
  ) {
    super(localityModel);
  }

  async createLocality(createLocalityDto: CreateLocalityDto) {
    try {
      const newLocality = await super.create({
        value: transformToLanguageMapType(createLocalityDto.value),
      });
      return newLocality;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
