import { Country } from '@/modules/countries/schemas/country.schema';
import { Locality } from '@/modules/localities/schemas/locality.schema';
import { Region } from '@/modules/regions/schemas/region.schema';
import { Thing } from '@/shared/schemas/thing.schema';
import { LanguageMapType } from '@/shared/types/language-map.type';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class PostalAddress extends Thing {
  //the postal code of the postal address Ej: "94043"
  @Prop({ required: false })
  postalCode: string;

  //the street address of the postal address. Ej: 38 avenue de l'Opéra
  @Prop({ type: Object, required: false })
  streetAddress: LanguageMapType;

  //the city of the postal address. Ej: Puerto del Sol
  @Prop({ type: Object, required: false })
  addressCity: LanguageMapType;

  //the country of the postal address EJ: United States
  @Prop({ type: String, ref: 'Country', required: false })
  addressCountry: Country;

  //the region of the postal address EJ: CO
  @Prop({ type: String, ref: 'Region', required: false })
  addressRegion: Region;

  //the locality of the postal address EJ: Seattle
  @Prop({ type: String, ref: 'Locality', required: false })
  addressLocality: Locality;

  // @Prop({ type: String, ref: 'Location' })
  // location?: Location;
}
export const PostalAddressSchema = SchemaFactory.createForClass(PostalAddress);
