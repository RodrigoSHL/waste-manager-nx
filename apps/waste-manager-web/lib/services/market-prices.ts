import { 
  Disposer, 
  Waste, 
  LatestPrice, 
  WasteComparison, 
  WasteStats,
  CreateDisposerDto,
  UpdatePriceDto,
  UpsertPriceResponse,
  PriceHistory
} from '@/lib/types/market-prices';

// Tipo para la vista de overview
interface PriceOverview {
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class MarketPricesService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    return response.json();
  }

  // Disposers
  async getDisposers(): Promise<Disposer[]> {
    return this.request<Disposer[]>('/market-prices/disposers');
  }

  async createDisposer(data: CreateDisposerDto): Promise<Disposer> {
    return this.request<Disposer>('/market-prices/disposers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDisposerPrices(disposerId: number): Promise<LatestPrice[]> {
    return this.request<LatestPrice[]>(`/market-prices/disposers/${disposerId}/prices`);
  }

  // Wastes
  async getWastes(): Promise<Waste[]> {
    return this.request<Waste[]>('/market-prices/wastes');
  }

  async getWasteComparison(wasteId: number): Promise<WasteComparison[]> {
    return this.request<WasteComparison[]>(`/market-prices/wastes/${wasteId}/comparison`);
  }

  async getWasteStats(wasteId: number): Promise<WasteStats> {
    return this.request<WasteStats>(`/market-prices/wastes/${wasteId}/stats`);
  }

  // Price History
  async getTimeSeries(disposerId: number, wasteId: number): Promise<PriceHistory[]> {
    return this.request<PriceHistory[]>(`/market-prices/disposers/${disposerId}/wastes/${wasteId}/history`);
  }

  async updatePrice(
    disposerId: number, 
    wasteId: number, 
    data: UpdatePriceDto
  ): Promise<UpsertPriceResponse> {
    return this.request<UpsertPriceResponse>(
      `/market-prices/disposers/${disposerId}/wastes/${wasteId}/price`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  // Overview
  async getOverview(): Promise<PriceOverview[]> {
    return this.request<PriceOverview[]>('/market-prices/overview');
  }

  // Seeds
  async runSeeds(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/market-prices/seed', {
      method: 'POST',
    });
  }
}

export const marketPricesService = new MarketPricesService();
