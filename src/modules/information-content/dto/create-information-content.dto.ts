import { LanguageMap } from '@/shared/types/language-map.type';
import { IsNotEmpty } from 'class-validator';

export class CreateInformationContentDto {
  @IsNotEmpty()
  //   @ValidateNested()
  //   @IsObject()
  //   @Type(() => Object)
  title: LanguageMap;

  @IsNotEmpty()
  //   @ValidateNested()
  //   @IsObject()
  //   @Type(() => Object)
  subtitle: LanguageMap;

  @IsNotEmpty()
  //   @ValidateNested()
  //   @IsObject()
  //   @Type(() => Object)
  body: LanguageMap;

  @IsNotEmpty()
  slug: LanguageMap;
}
