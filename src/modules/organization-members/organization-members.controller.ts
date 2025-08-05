import { Controller } from '@nestjs/common';
import { OrganizationMembersService } from './organization-members.service';

@Controller('organization-members')
export class OrganizationMembersController {
  constructor(private readonly organizationMembersService: OrganizationMembersService) { }

}
