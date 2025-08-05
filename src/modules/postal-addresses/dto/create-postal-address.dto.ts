import { Country } from '@/modules/countries/schemas/country.schema';
import { Locality } from '@/modules/localities/schemas/locality.schema';
import { Region } from '@/modules/regions/schemas/region.schema';
import { LanguageMap } from '@/shared/types/language-map.type';
import { IsOptional, IsString } from 'class-validator';

export class CreatePostalAddressDto {
  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  streetAddress?: LanguageMap;

  @IsOptional()
  @IsString()
  addressCity?: LanguageMap;

  @IsOptional()
  @IsString()
  addressCountry?: Country['_id'];

  @IsOptional()
  @IsString()
  addressRegion?: Region['_id'];

  @IsOptional()
  @IsString()
  addressLocality?: Locality['_id'];

  //     @Type(() => CreateLocationDto)
  //     @IsOptional()
  //     location?: CreateLocationDto;
}
