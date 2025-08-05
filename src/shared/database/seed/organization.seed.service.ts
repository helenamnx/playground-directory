import { Injectable } from '@nestjs/common';
import { OrganizationsService } from '@/modules/organizations/organizations.service';
import { CreateOrganizationDto } from '@/modules/organizations/dto/create-organization.dto';
import organizationMock from '@/shared/database/data/seed-mocks/development-seed/organization.mock.json';
import { LocalitiesService } from '@/modules/localities/localities.service';

@Injectable()
export class OrganizationSeedService {
  private readonly platformMock =
    process.env.NODE_ENV === 'development'
      ? organizationMock
      : organizationMock; //TODO: add seed for production

  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly localityService: LocalitiesService,
  ) {}

  async seedOrganization() {
    try {
      const organizationCount =
        await this.organizationsService.countDocuments();
      if (organizationCount > 0) return;

      let storedLocality = await this.localityService.findOne({
        filterOptions: {
          'value.languageMap.es': organizationMock.address.addressLocality.es,
        },
        triggerError: false,
      });
      if (!storedLocality) {
        storedLocality = await this.localityService.createLocality({
          value: organizationMock.address.addressLocality,
        });
      }
      // Map the mock data to the DTO
      const createOrganizationDto: CreateOrganizationDto = {
        name: organizationMock.name,
        description: organizationMock.description,
        shortDescription: organizationMock.shortDescription,
        organizationType: organizationMock.organizationType,
        contactPerson: organizationMock.contactPerson,
        contactPoints: organizationMock.contactPoints,
        organizationSchedule: organizationMock.organizationSchedule,
        website: organizationMock.website,
        address: {
          ...organizationMock.address,
          addressLocality: storedLocality._id,
        },
      };

      // Create the organization
      const newOrganization =
        await this.organizationsService.createOrganization(
          createOrganizationDto,
        );

      console.log(
        `Organization "${newOrganization.name}" created successfully.`,
      );
    } catch (error) {
      console.error('Error seeding organizations:', error);
    }
  }
}
