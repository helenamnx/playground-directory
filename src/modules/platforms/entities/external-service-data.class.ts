import { ServiceForPlatformDto } from '../dto/upsert-service-for-platform.dto';
import { Platform } from './platform.entity';

export class ExternalServiceData {
  baseURL: string;
  externalPlatformId: string;
  name: string;
  alias: string;
  isActive: boolean;

  constructor(service: ServiceForPlatformDto, storedServicePlatform: Platform) {
    this.baseURL = service.baseURL || storedServicePlatform.baseURL;
    this.externalPlatformId = storedServicePlatform.alias;
    this.name = service.name || storedServicePlatform.name;
    this.alias = service.alias || storedServicePlatform.alias;
    this.isActive =
      service.configuration.isActive ||
      storedServicePlatform.configuration.isActive;
  }
}
