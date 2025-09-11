export class WasteCategoryDto {
  id!: number;
  wasteTypeId!: number;
  code!: string;
  name!: string;
  description?: string;
  technicalSpecs?: Record<string, unknown>;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  wasteType?: {
    id: number;
    code: string;
    name: string;
    color?: string;
    icon?: string;
  };
}

export class CreateWasteCategoryDto {
  wasteTypeId!: number;
  code!: string;
  name!: string;
  description?: string;
  technicalSpecs?: Record<string, unknown>;
  isActive?: boolean;
}

export class UpdateWasteCategoryDto {
  wasteTypeId?: number;
  code?: string;
  name?: string;
  description?: string;
  technicalSpecs?: Record<string, unknown>;
  isActive?: boolean;
}
