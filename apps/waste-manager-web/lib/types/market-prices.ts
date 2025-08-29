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
  contact_name: string;
  email: string;
  phone?: string;
  role?: string;
  is_primary: boolean;
  created_at: string;
}

export interface Waste {
  id: number;
  code: string;
  name: string;
  description?: string;
  hazard_class?: string;
  created_at: string;
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

// DTOs para crear/actualizar
export interface CreateDisposerDto {
  legal_name: string;
  trade_name?: string;
  rut: string;
  website?: string;
  contacts?: CreateDisposerContactDto[];
}

export interface CreateDisposerContactDto {
  contact_name: string;
  email: string;
  phone?: string;
  role?: string;
  is_primary?: boolean;
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
