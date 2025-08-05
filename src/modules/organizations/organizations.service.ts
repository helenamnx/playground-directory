import { Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { Organization } from './schemas/organization.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostalAddressesService } from '../postal-addresses/postal-addresses.service';
import { ContactPointsService } from '../contact-points/contact-points.service';
import { CustomErrorResponse } from '@/shared/responses/error/custom-error-response.class';
import { ImagesService } from '../images/images.service';
import { transform } from '@swc/core';
import { transformToLanguageMapType } from '@/shared/utils/utils';
@Injectable()
export class OrganizationsService extends CRUDService<Organization> {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
    private readonly postalAddressesService: PostalAddressesService,
    private readonly contactPointsService: ContactPointsService,
    private readonly imagesService: ImagesService,
  ) {
    super(organizationModel);
  }

  async createOrganization(createOrganizationDto: CreateOrganizationDto) {
    try {
      let newContactPoints: string[];
      if (createOrganizationDto.contactPoints) {
        newContactPoints = await Promise.all(
          createOrganizationDto.contactPoints.map(async (contactPoint) => {
            const newContactPoint =
              await this.contactPointsService.create(contactPoint);
            return newContactPoint._id;
          }),
        );
      }
      let address: string | null = null;
      if (createOrganizationDto.address) {
        const newPostalAddress =
          await this.postalAddressesService.createPostalAddress(
            createOrganizationDto.address,
          );
        address = newPostalAddress._id;
      }
      const createdOrganization = await super.create({
        ...createOrganizationDto,
        address: address,
        contactPoints: newContactPoints,
        description: transformToLanguageMapType(
          createOrganizationDto.description,
        ),
        shortDescription: transformToLanguageMapType(
          createOrganizationDto.shortDescription,
        ),
        images: [],
      });

      //TODO: IF images are provided, create them and add to the organization
      // const newImages = await Promise.all(
      //   createOrganizationDto.images.map(async (image) => {
      //     const newImage = await this.imagesService.create(image);
      //     return newImage._id;
      //   }),
      // );

      // await super.update(createdOrganization._id, {
      //   images: newImages,
      // });

      return createdOrganization;
      //TODO: add history
    } catch (error) {
      //TODO: add history
      console.log(error);
      throw new CustomErrorResponse(error);
    }
  }

  async findAll() {
    const allOrganizations = await super.findAll({});
    return allOrganizations;
  }

  async findByID(id: string) {
    const organization = await super.findOne({ filterOptions: { _id: id } });
    return organization;
  }

  //TODO: stop using this function

  async findByUUID(uuid: string) {
    try {
      const organization = await super.findOne({
        filterOptions: { _id: uuid },
      });

      return organization;
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  async findByName(name: string) {
    try {
      const organization = await super.findOne({
        filterOptions: { name: name },
        triggerError: false,
      });
      return organization;
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  async updateOrganization(updateOrganizationDto: UpdateOrganizationDto) {
    try {
      // Search for the organization by UUID
      const organization = await this.findByUUID(
        updateOrganizationDto.organizationUUID,
      );

      if (updateOrganizationDto.address) {
        // update or create the postal address
        const updatedPostalAddress =
          await this.postalAddressesService.findOrCreatePostalAddress(
            updateOrganizationDto.address,
          );
        // Update the organization
        await super.update(organization._id, {
          $addToSet: { address: updatedPostalAddress._id },
        });
      }

      // Update or create the contact points
      //TODO: convert to Promise all

      if (updateOrganizationDto.contactPoints) {
        const contactPointsIds = [];

        for (const contactPoint of updateOrganizationDto.contactPoints) {
          const contactPointToUpdate =
            await this.contactPointsService.findOrCreateContactPoint(
              contactPoint,
            );
          contactPointsIds.push(contactPointToUpdate._id);
        }
        // Update the organization
        await super.update(organization._id, {
          contactPoints: contactPointsIds ? contactPointsIds : [],
        });
      }
      //TODO: refactor
      // Update the organization
      const updatedOrganization = await super.update(organization._id, {
        description:
          updateOrganizationDto.description || organization.description,
        shortDescription:
          updateOrganizationDto.shortDescription ||
          organization.shortDescription,
        contactPerson:
          updateOrganizationDto.contactPerson || organization.contactPerson,
        organizationSchedule:
          updateOrganizationDto.organizationSchedule ||
          organization.organizationSchedule,
        website: updateOrganizationDto.website || organization.website,
      });
      const populatedOrganization = await super.findOne({
        filterOptions: { _id: updatedOrganization._id },
        populateOptions: ['address', 'contactPoints'],
      });
      //TODO: add history
      return populatedOrganization;
    } catch (error) {
      //TODO: add history

      throw new CustomErrorResponse(error);
    }
  }

  async countDocuments() {
    return this.organizationModel.countDocuments();
  }
}
