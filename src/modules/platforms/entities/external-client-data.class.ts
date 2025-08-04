import {
  ClientForPlatformDto,
  ServiceForPlatformDto,
} from '../dto/upsert-service-for-platform.dto';
import { Platform } from './platform.entity';

export class ExternalClientData {
  baseURL: string;
  externalPlatformId: string;
  name: string;
  alias: string;
  configuration: any;

  constructor(
    client: ClientForPlatformDto,
    storedClientPlatform: Platform,
    storedOwnPlatform: Platform,
    service: ServiceForPlatformDto,
  ) {
    this.baseURL = client.baseURL || storedClientPlatform.baseURL;
    // this.externalPlatformId =
    //   storedClientPlatform.alias === storedOwnPlatform.alias
    //     ? storedClientPlatform._id
    //     : storedClientPlatform.externalPlatformId;
    this.name = client.name || storedClientPlatform.name;
    this.alias = client.alias || storedClientPlatform.alias;
    this.configuration = service.configuration;
  }
}
