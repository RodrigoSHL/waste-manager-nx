// Tipos base para las entidades del backend
export interface Disposer {
  id: number;
  legal_name: string;
  trade_name?: string;
  rut: string;
  website?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  contacts: DisposerContact[];
  disposerWastes: DisposerWaste[];
}

export interface DisposerContact {
  id: number;
  disposer_id: number;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  department?: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
}

// Nuevos tipos para la jerarquía
export interface WasteType {
  id: number;
  code: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categories: WasteCategory[];
}

export interface WasteCategory {
  id: number;
  wasteTypeId: number;
  code: string;
  name: string;
  description?: string;
  technicalSpecs?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  wasteType?: WasteType;
  wastes?: Waste[];
}

export interface Waste {
  id: number;
  wasteCategoryId: number;
  code: string;
  name: string;
  subproductName?: string;
  description?: string;
  hazardClass?: string;
  specifications?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  wasteCategory?: WasteCategory;
}

// Tipo para la vista de jerarquía completa
export interface WasteHierarchy {
  type_id: number;
  type_code: string;
  type_name: string;
  type_color?: string;
  type_icon?: string;
  category_id?: number;
  category_code?: string;
  category_name?: string;
  category_specs?: Record<string, unknown>;
  waste_id?: number;
  waste_code?: string;
  waste_name?: string;
  subproduct_name?: string;
  waste_description?: string;
  hazard_class?: string;
  waste_specs?: Record<string, unknown>;
  full_hierarchy: string;
}

export interface Uom {
  id: number;
  code: string;
  description: string;
}

export interface Currency {
  id: number;
  code: string;
  symbol: string;
  decimals: number;
}

export interface DisposerWaste {
  id: number;
  disposer_id: number;
  waste_id: number;
  uom_id: number;
  currency_id: number;
  min_lot?: number;
  lead_time_days?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  disposer: Disposer;
  waste: Waste;
  uom: Uom;
  currency: Currency;
  priceHistory: PriceHistory[];
}

export interface PriceHistory {
  id: number;
  disposer_waste_id: number;
  price: number;
  price_period: string;
  source?: string;
  notes?: string;
  created_at: string;
}

// Tipos para las vistas y respuestas del API
export interface LatestPrice {
  id: number;
  price: number;
  price_period: string;
  source?: string;
  notes?: string;
  created_at: string;
  waste: {
    id: number;
    code: string;
    name: string;
  };
  uom: {
    code: string;
    description: string;
  };
  currency: {
    code: string;
    symbol: string;
  };
  min_lot?: number;
  lead_time_days?: number;
}

export interface WasteComparison {
  id: number;
  price: number;
  price_period: string;
  source?: string;
  created_at: string;
  disposer: {
    id: number;
    legal_name: string;
    trade_name?: string;
  };
  uom: {
    code: string;
  };
  currency: {
    code: string;
    symbol: string;
  };
  min_lot?: number;
  lead_time_days?: number;
}

export interface WasteStats {
  wasteId: number;
  disposerCount: number;
  minPrice: number | null;
  maxPrice: number | null;
  avgPrice: number | null;
  prices: WasteComparison[];
}

// DTOs para el frontend
export interface CreateDisposerDto {
  legal_name: string;
  trade_name?: string;
  rut: string;
  website?: string;
  is_active?: boolean;
  contacts?: CreateContactDto[];
}

export interface CreateContactDto {
  contact_name: string;
  email: string;
  phone?: string;
  role?: string;
  is_primary?: boolean;
}

export interface CreateWasteDto {
  wasteCategoryId: number;
  code: string;
  name: string;
  subproductName?: string;
  description?: string;
  hazardClass?: string;
  specifications?: Record<string, unknown>;
}

export interface UpdateWasteDto {
  wasteCategoryId?: number;
  code?: string;
  name?: string;
  subproductName?: string;
  description?: string;
  hazardClass?: string;
  specifications?: Record<string, unknown>;
}

export interface CreateWasteTypeDto {
  code: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface CreateWasteCategoryDto {
  wasteTypeId: number;
  code: string;
  name: string;
  description?: string;
  technicalSpecs?: Record<string, unknown>;
}

export interface UpdatePriceDto {
  price: number;
  source?: string;
  notes?: string;
}

// Respuesta del API para upsert de precios
export interface UpsertPriceResponse {
  message: string;
  priceHistory: PriceHistory;
  disposerWaste: DisposerWaste;
}

// Tipo para la vista de overview
export interface PriceOverview {
  price_id: number;
  price: number;
  price_period: string;
  source?: string;
  price_created_at: string;
  disposer_waste_id: number;
  min_lot?: number;
  lead_time_days?: number;
  disposer_notes?: string;
  disposer_id: number;
  disposer_legal_name: string;
  disposer_trade_name?: string;
  disposer_rut: string;
  waste_id: number;
  waste_code: string;
  waste_name: string;
  waste_description?: string;
  hazard_class?: string;
  uom_code: string;
  uom_description: string;
  currency_code: string;
  currency_symbol: string;
  currency_decimals: number;
}
