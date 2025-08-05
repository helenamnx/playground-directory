import { IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsOptional()
  value?: string;
}
