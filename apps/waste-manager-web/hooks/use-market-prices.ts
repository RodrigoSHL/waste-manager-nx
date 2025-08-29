'use client';

import { useState, useEffect } from 'react';
import { marketPricesService } from '@/lib/services/market-prices';
import { Disposer, Waste, CreateDisposerDto, CreateWasteDto, UpdateWasteDto, PriceOverview } from '@/lib/types/market-prices';

// Hook para dispositores
export function useDisposers() {
  const [disposers, setDisposers] = useState<Disposer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisposers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await marketPricesService.getDisposers();
      setDisposers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const createDisposer = async (data: CreateDisposerDto) => {
    try {
      const newDisposer = await marketPricesService.createDisposer(data);
      setDisposers(prev => [...prev, newDisposer]);
      return newDisposer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando dispositor';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchDisposers();
  }, []);

  return {
    disposers,
    isLoading,
    error,
    refetch: fetchDisposers,
    createDisposer,
  };
}

// Hook para residuos
export function useWastes() {
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWastes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await marketPricesService.getWastes();
      setWastes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const createWaste = async (data: CreateWasteDto) => {
    try {
      const newWaste = await marketPricesService.createWaste(data);
      setWastes(prev => [...prev, newWaste]);
      return newWaste;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando residuo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateWaste = async (wasteId: number, data: UpdateWasteDto) => {
    try {
      const updatedWaste = await marketPricesService.updateWaste(wasteId, data);
      setWastes(prev => prev.map(waste => waste.id === wasteId ? updatedWaste : waste));
      return updatedWaste;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando residuo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteWaste = async (wasteId: number) => {
    try {
      await marketPricesService.deleteWaste(wasteId);
      setWastes(prev => prev.filter(waste => waste.id !== wasteId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando residuo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchWastes();
  }, []);

  return {
    wastes,
    isLoading,
    error,
    refetch: fetchWastes,
    createWaste,
    updateWaste,
    deleteWaste,
  };
}

// Hook para seeds
export function useSeeds() {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSeeds = async () => {
    try {
      setIsRunning(true);
      setError(null);
      const result = await marketPricesService.runSeeds();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error ejecutando seeds';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  return {
    runSeeds,
    isRunning,
    error,
  };
}

// Interfaz para los datos que realmente devuelve el backend
interface BackendOverviewItem {
  id: number;
  price: string; // Viene como string desde PostgreSQL
  price_period: string;
  source?: string;
  created_at: string;
  disposer_id: number;
  legal_name: string;
  trade_name?: string;
  waste_id: number;
  waste_code: string;
  waste_name: string;
  uom_code: string;
  currency_code: string;
  currency_symbol: string;
  min_lot?: string; // También viene como string
  lead_time_days?: number;
}

// Hook para la vista general de precios (overview)
export function usePricesOverview() {
  const [overview, setOverview] = useState<PriceOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await marketPricesService.getOverview() as unknown as BackendOverviewItem[];
      
      // Mapear los datos del backend al formato esperado por el frontend
      const transformedData: PriceOverview[] = data.map((item: BackendOverviewItem) => ({
        price_id: item.id,
        price: parseFloat(item.price) || 0, // Convertir string a number
        price_period: item.price_period,
        source: item.source,
        price_created_at: item.created_at,
        disposer_waste_id: 0, // Este campo no viene del backend actual
        min_lot: item.min_lot ? parseFloat(item.min_lot) : undefined,
        lead_time_days: item.lead_time_days,
        disposer_notes: undefined, // No disponible en el backend actual
        disposer_id: item.disposer_id,
        disposer_legal_name: item.legal_name,
        disposer_trade_name: item.trade_name,
        disposer_rut: '', // No disponible en el backend actual
        waste_id: item.waste_id,
        waste_code: item.waste_code,
        waste_name: item.waste_name,
        waste_description: undefined, // No disponible en el backend actual
        hazard_class: undefined, // No disponible en el backend actual
        uom_code: item.uom_code,
        uom_description: item.uom_code, // Usar el código como descripción por ahora
        currency_code: item.currency_code,
        currency_symbol: item.currency_symbol,
        currency_decimals: 0, // Valor por defecto, podrías mapear según la moneda
      }));
      
      setOverview(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando vista general');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrice = async (disposerId: number, wasteId: number, priceData: { price: number; source?: string; notes?: string }) => {
    try {
      const result = await marketPricesService.updatePrice(disposerId, wasteId, priceData);
      await fetchOverview(); // Recargar la vista
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando precio';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return {
    overview,
    isLoading,
    error,
    refetch: fetchOverview,
    updatePrice,
  };
}
