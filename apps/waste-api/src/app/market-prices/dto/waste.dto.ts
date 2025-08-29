import { IsString, IsOptional, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

/**
 * DTO para crear un nuevo residuo
 */
export class CreateWasteDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  hazard_class?: string;
}

/**
 * DTO para actualizar un residuo existente
 */
export class UpdateWasteDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  hazard_class?: string;
}
