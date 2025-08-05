import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateContactPointDto } from './dto/create-contact-point.dto';
import { UpdateContactPointDto } from './dto/update-contact-point.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ContactPoint } from './schemas/contact-point.schema';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { Model } from 'mongoose';
import { CustomErrorResponse } from '@/shared/responses/error/custom-error-response.class';
import { transformToLanguageMapType } from '@/shared/utils/utils';
import { LanguageMap, LanguageMapType } from '@/shared/types/language-map.type';

@Injectable()
export class ContactPointsService extends CRUDService<ContactPoint> {
  constructor(
    @InjectModel(ContactPoint.name)
    private readonly contactPointModel: Model<ContactPoint>,
  ) {
    super(contactPointModel);
  }

  async createContactPoint(createContactPointDto: CreateContactPointDto) {
    try {
      let name: LanguageMapType | null = null;
      if (createContactPointDto.name) {
        name = transformToLanguageMapType(createContactPointDto.name);
      }
      const createdContactPoint = await super.create({
        ...createContactPointDto,
        name,
      });
      return createdContactPoint;
      //TODO: add history
    } catch (error) {
      //TODO: add history

      throw new CustomErrorResponse(error);
    }
  }

  async findAll() {
    const allContactPoints = await super.findAll({});
    return allContactPoints;
  }

  async findByID(id: string) {
    const contactPoint = await super.findOne({
      filterOptions: {
        _id: id,
      },
    });
    return contactPoint;
  }

  //TODO: check if this function makes sense
  async findContactPointByUUID(uuid: string) {
    try {
      const contactPoint = await this.contactPointModel
        .findOne({ _id: uuid })
        .exec();
      return contactPoint;
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  async updateContactPoint(
    _id: string,
    updateContactPointDto: UpdateContactPointDto,
  ): Promise<ContactPoint> {
    const updatedContactPoint = await super.update(_id, updateContactPointDto);
    return updatedContactPoint;
  }

  async findOrCreateContactPoint(contactPoint: UpdateContactPointDto) {
    try {
      //Search for the contact point by UUID
      const contactPointToUpdate = await super.findOne({
        filterOptions: { _id: contactPoint.contactPointUUID },
        triggerError: false,
      });

      if (!contactPointToUpdate) {
        // If it does not exist, create the contact point
        const createdContactPoint = await this.createContactPoint(
          contactPoint as CreateContactPointDto,
        );
        return createdContactPoint;
      } else {
        // If it exists, update the contact point
        const updatedContactPoint = await this.updateContactPoint(
          contactPoint.contactPointUUID,
          contactPoint,
        );
        return updatedContactPoint;
      }
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }
}
