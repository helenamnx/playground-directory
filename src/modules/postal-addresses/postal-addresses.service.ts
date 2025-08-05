import { Injectable } from '@nestjs/common';
import { CreatePostalAddressDto } from './dto/create-postal-address.dto';
import { UpdatePostalAddressDto } from './dto/update-postal-address.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { PostalAddress } from './schemas/postal-address.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomErrorResponse } from '@/shared/responses/error/custom-error-response.class';
import { transformToLanguageMapType } from '@/shared/utils/utils';
import { CountriesService } from '../countries/countries.service';
import { LocalitiesService } from '../localities/localities.service';
import { RegionsService } from '../regions/regions.service';

@Injectable()
export class PostalAddressesService extends CRUDService<PostalAddress> {
  constructor(
    @InjectModel('PostalAddress')
    private readonly postalAddressModel: Model<PostalAddress>,
    private readonly countriesService: CountriesService,
    private readonly regionsService: RegionsService,
    private readonly localitiesService: LocalitiesService,
  ) {
    super(postalAddressModel);
  }

  async createPostalAddress(createPostalAddressDto: CreatePostalAddressDto) {
    try {
      const {
        streetAddress,
        addressCountry,
        addressRegion,
        addressLocality,
        addressCity,
      } = createPostalAddressDto;

      let countryId: string = null;
      let regionId: string = null;
      let localityId: string = null;
      //find the country, region and locality
      if (addressCountry) {
        const storedCountry = await this.countriesService.findOne({
          filterOptions: {
            _id: addressCountry,
          },
        });
        countryId = storedCountry._id;
      }

      if (addressRegion) {
        const storedRegion = await this.regionsService.findOne({
          filterOptions: {
            _id: addressRegion,
          },
        });
        regionId = storedRegion._id;
      }

      if (addressLocality) {
        const storedLocality = await this.localitiesService.findOne({
          filterOptions: {
            _id: addressLocality,
          },
        });
        localityId = storedLocality._id;
      }
      //create the postal address
      const newPostalAddress = await super.create({
        ...createPostalAddressDto,
        addressCountry: countryId,
        addressRegion: regionId,
        addressLocality: localityId,
        addressCity: addressCity
          ? transformToLanguageMapType(addressCity)
          : null,
        streetAddress: streetAddress
          ? transformToLanguageMapType(streetAddress)
          : null,
      });
      return newPostalAddress;
      //TODO: add history
    } catch (error) {
      //TODO: add history

      throw new CustomErrorResponse(error);
    }
  }

  findAll() {
    return super.findAll({});
  }

  async findPostalAddressByID(id: string): Promise<PostalAddress> {
    try {
      const postalAddress = await super.findOne({
        filterOptions: { _id: id },
      });
      return postalAddress;
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  async updatePostalAddress(
    _id: string,
    updatePostalAddressDto: UpdatePostalAddressDto,
  ): Promise<PostalAddress> {
    try {
      const updatedPostalAddress = await super.update(
        _id,
        updatePostalAddressDto,
      );
      //TODO: add history
      return updatedPostalAddress;
    } catch (error) {
      //TODO: add history

      throw new CustomErrorResponse(error);
    }
  }

  //TODO: check if this function makes sense
  async findOrCreatePostalAddress(
    updatePostalAddressDto: UpdatePostalAddressDto,
  ): Promise<PostalAddress> {
    try {
      const { _id } = updatePostalAddressDto;
      // Search for the postal address by UUID
      const storedPostalAddress = await this.findPostalAddressByID(_id);

      if (!storedPostalAddress) {
        // If it does not exist, create the postal address
        const createdPostalAddress = await this.createPostalAddress(
          updatePostalAddressDto as CreatePostalAddressDto,
        );
        return createdPostalAddress;
      } else {
        // If it exists, update the postal address
        const updatedPostalAddress = await this.updatePostalAddress(
          _id,
          updatePostalAddressDto as UpdatePostalAddressDto,
        );
        return updatedPostalAddress;
      }
      //TODO: add history
    } catch (error) {
      //TODO: add history
      console.log(error);
      throw error;
    }
  }
}
