import { IsString, IsArray, IsEmail, IsOptional, IsEnum, IsNumber, Min, ArrayNotEmpty } from 'class-validator';
import { DisposerStatus } from '../entities/disposer.entity';

export class CreateDisposerDto {
  @IsString()
  name!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  wasteTypes!: string[];

  @IsString()
  location!: string;

  @IsString()
  phone!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  plasticRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cardboardRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  metalRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  organicRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  glassRate?: number;

  @IsOptional()
  @IsEnum(DisposerStatus)
  status?: DisposerStatus;
}
