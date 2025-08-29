'use client';

import { useState, useEffect } from 'react';
import { marketPricesService } from '@/lib/services/market-prices';
import { Disposer, Waste, CreateDisposerDto, CreateWasteDto, UpdateWasteDto } from '@/lib/types/market-prices';

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
