import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { Country } from './schemas/country.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CountriesService extends CRUDService<Country> {
  constructor(@InjectModel(Country.name) private countryModel: Model<Country>) {
    super(countryModel);
  }
}
