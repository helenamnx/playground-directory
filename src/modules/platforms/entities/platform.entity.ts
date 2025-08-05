import { Organization } from '@/modules/organizations/schemas/organization.schema';
import { PlatformConfiguration } from '@/modules/platform-configurations/entities/platform-configuration.entity';

export class Platform {
  name: string;
  alias: string;
  description: string;
  clients?: string[] = [];
  services?: string[] = [];
  baseURL: string;
  configuration?: PlatformConfiguration;
  organization?: Organization

  constructor(data: Partial<Platform>) {
    this.name = data.name;
    this.alias = data.alias;
    this.description = data.description;
    this.baseURL = data.baseURL;
    this.configuration = new PlatformConfiguration();
  }
}
