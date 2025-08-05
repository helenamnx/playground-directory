import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactPointsModule } from '../contact-points/contact-points.module';
import { PostalAddressesModule } from '../postal-addresses/postal-addresses.module';
import { Organization, OrganizationSchema } from './schemas/organization.schema';
import { ImagesModule } from '../images/images.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Organization.name, schema: OrganizationSchema }]),
    PostalAddressesModule,
    ContactPointsModule,
    ImagesModule,
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule { }
