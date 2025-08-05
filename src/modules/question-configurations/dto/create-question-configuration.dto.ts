import { IsNotEmpty, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateQuestionConfigurationDto {
  @IsNotEmpty()
  @IsNumber()
  negativeMarking?: number;

  @IsNotEmpty()
  @IsBoolean()
  partialMarking?: boolean;

  @IsNotEmpty()
  @IsBoolean()
  timed?: boolean;

  @IsOptional()
  @IsNumber()
  timeLimit?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsNotEmpty({ each: true })
  roles?: string[];
}
