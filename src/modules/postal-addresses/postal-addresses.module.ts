import { Module } from '@nestjs/common';
import { PostalAddressesService } from './postal-addresses.service';
import { PostalAddressesController } from './postal-addresses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PostalAddress,
  PostalAddressSchema,
} from './schemas/postal-address.schema';
import { CountriesModule } from '../countries/countries.module';
import { RegionsModule } from '../regions/regions.module';
import { LocalitiesModule } from '../localities/localities.module';

@Module({
  imports: [
    CountriesModule,
    RegionsModule,
    LocalitiesModule,
    MongooseModule.forFeature([
      { name: PostalAddress.name, schema: PostalAddressSchema },
    ]),
  ],
  controllers: [PostalAddressesController],
  providers: [PostalAddressesService],
  exports: [PostalAddressesService],
})
export class PostalAddressesModule {}
