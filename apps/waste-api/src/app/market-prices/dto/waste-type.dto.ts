export class WasteTypeDto {
  id!: number;
  code!: string;
  name!: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class CreateWasteTypeDto {
  code!: string;
  name!: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export class UpdateWasteTypeDto {
  code?: string;
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}
