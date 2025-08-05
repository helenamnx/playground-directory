import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LanguageMap, LanguageMapType } from '@/shared/types/language-map.type';

class CreateCategorySeedDto {
  @IsString()
  title: string;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsObject()
  scope?: LanguageMapType[];

  @IsOptional()
  @IsArray()
  parentCategories?: string[];

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsNotEmpty({ each: true })
  roles?: string[];
}

class CreateQuestionConfigurationSeedDto {
  @IsBoolean()
  negativeMarking: boolean;

  @IsBoolean()
  partialMarking: boolean;

  @IsBoolean()
  timed: boolean;

  @IsOptional()
  @IsNumber()
  timeLimit?: number;

  @IsNumber()
  weight: number;
}

class CreateAnswerOptionSeedDto {
  @IsString()
  value: string;

  @IsBoolean()
  isCorrect: boolean;

  @IsOptional()
  @IsString()
  justification?: string;
}

export class CreateQuestionSeedDto {
  @IsString()
  difficulty: string;

  @ValidateNested()
  @Type(() => Object)
  information: {
    title: string;
    author?: string;
    alias?: string;
    content?: string;
  };

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCategorySeedDto)
  categories: CreateCategorySeedDto[];

  @ValidateNested()
  @Type(() => CreateQuestionConfigurationSeedDto)
  questionConfiguration: CreateQuestionConfigurationSeedDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerOptionSeedDto)
  answerOptions: CreateAnswerOptionSeedDto[];

  @IsObject()
  @IsString()
  observations?: LanguageMap;
}
