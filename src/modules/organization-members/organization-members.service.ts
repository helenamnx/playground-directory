import { Injectable } from '@nestjs/common';
import { CreateOrganizationMemberDto } from './dto/create-organization-member.dto';
import { UpdateOrganizationMemberDto } from './dto/update-organization-member.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { InjectModel } from '@nestjs/mongoose';
import { OrganizationMember } from './schemas/organization-member.schema';
import { Model } from 'mongoose';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { App } from 'supertest/types';
import { AppUsersService } from '../app-users/app-users.service';
import { CustomErrorResponse } from '@/shared/responses/error/custom-error-response.class';

@Injectable()
export class OrganizationMembersService extends CRUDService<OrganizationMember> {
  constructor(
    @InjectModel(OrganizationMember.name)
    private organizationMemberModel: Model<OrganizationMember>,
    private readonly appUsersService: AppUsersService,
    private readonly organizationsService: OrganizationsService,

  ) {
    super(organizationMemberModel);
  }
  async createOrganizationUser(
    createOrganizationUserDto: CreateOrganizationMemberDto,
  ) {
    try {
      const storedUser = await this.appUsersService.findOne({
        filterOptions: { _id: createOrganizationUserDto.user },
      });

      const storedOrganization = await this.organizationsService.findByID(
        createOrganizationUserDto.organization,
      );

      const newOrganizationUser = await super.create({
        user: storedUser._id,
        organization: storedOrganization._id,
      });

      //TODO: add history
      return newOrganizationUser;
    } catch (error) {
      //TODO: add history

      throw new CustomErrorResponse(error);
    }
  }
}
