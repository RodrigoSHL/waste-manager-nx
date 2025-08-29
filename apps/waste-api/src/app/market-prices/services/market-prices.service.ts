import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MarketPricesRepository } from '../repositories/market-prices.repository';

@Injectable()
export class MarketPricesService {
  constructor(
    private readonly marketPricesRepository: MarketPricesRepository,
  ) {}

  /**
   * Obtiene los últimos precios vigentes de todos los residuos que maneja un dispositor
   */
  async getLatestPricesByDisposer(disposerId: number) {
    const prices = await this.marketPricesRepository.getLatestPricesByDisposer(disposerId);
    
    if (prices.length === 0) {
      throw new NotFoundException(`No se encontraron precios vigentes para el dispositor ${disposerId}`);
    }

    return prices;
  }

  /**
   * Obtiene la serie histórica de precios para graficar
   */
  async getTimeSeries(disposerId: number, wasteId: number) {
    const timeSeries = await this.marketPricesRepository.getTimeSeries(disposerId, wasteId);
    
    if (timeSeries.length === 0) {
      throw new NotFoundException(
        `No se encontró historial de precios para dispositor ${disposerId} y residuo ${wasteId}`
      );
    }

    return timeSeries;
  }

  /**
   * Compara los precios actuales entre dispositores para un residuo específico
   */
  async compareLatestForWaste(wasteId: number) {
    const comparison = await this.marketPricesRepository.compareLatestForWaste(wasteId);
    
    if (comparison.length === 0) {
      throw new NotFoundException(`No se encontraron precios vigentes para el residuo ${wasteId}`);
    }

    return comparison;
  }

  /**
   * Actualiza o inserta un nuevo precio
   * Cierra el precio vigente actual (si existe) y crea uno nuevo
   */
  async upsertNewPrice(
    disposerId: number,
    wasteId: number,
    price: number,
    source?: string,
    notes?: string,
  ) {
    if (price <= 0) {
      throw new BadRequestException('El precio debe ser mayor a 0');
    }

    // Verificar que existe la relación dispositor-residuo
    const disposerWaste = await this.marketPricesRepository.findDisposerWaste(
      disposerId,
      wasteId,
    );

    if (!disposerWaste) {
      throw new NotFoundException(
        `No se encontró relación activa entre dispositor ${disposerId} y residuo ${wasteId}`
      );
    }

    const now = new Date();

    // Cerrar el precio actual si existe
    await this.marketPricesRepository.closeCurrentPrice(disposerWaste.id, now);

    // Crear el nuevo precio
    const newPrice = await this.marketPricesRepository.createPriceHistory(
      disposerWaste.id,
      price,
      now,
      source,
      notes,
    );

    return {
      message: 'Precio actualizado exitosamente',
      priceHistory: newPrice,
      disposerWaste,
    };
  }

  /**
   * Obtiene todos los dispositores activos
   */
  async getAllDisposers() {
    return this.marketPricesRepository.findAllDisposers();
  }

  /**
   * Obtiene todos los residuos
   */
  async getAllWastes() {
    return this.marketPricesRepository.findAllWastes();
  }

  /**
   * Obtiene una vista consolidada de todos los precios actuales
   */
  async getLatestPricesOverview() {
    return this.marketPricesRepository.getLatestPricesView();
  }

  /**
   * Obtiene el precio actual para una combinación específica dispositor-residuo
   */
  async getCurrentPrice(disposerId: number, wasteId: number) {
    const timeSeries = await this.marketPricesRepository.getTimeSeries(disposerId, wasteId);
    
    if (timeSeries.length === 0) {
      throw new NotFoundException(
        `No se encontró precio para dispositor ${disposerId} y residuo ${wasteId}`
      );
    }

    // El precio actual es el que tiene un período abierto (sin fecha de fin)
    const currentPrice = timeSeries.find(price => 
      price.price_period.includes(',)')
    );

    if (!currentPrice) {
      throw new NotFoundException(
        `No se encontró precio vigente para dispositor ${disposerId} y residuo ${wasteId}`
      );
    }

    return currentPrice;
  }

  /**
   * Obtiene estadísticas de precios para un residuo específico
   */
  async getWastePriceStats(wasteId: number) {
    const comparison = await this.marketPricesRepository.compareLatestForWaste(wasteId);
    
    if (comparison.length === 0) {
      return {
        wasteId,
        disposerCount: 0,
        minPrice: null,
        maxPrice: null,
        avgPrice: null,
        prices: [],
      };
    }

    const prices = comparison.map(item => parseFloat(item.price.toString()));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    return {
      wasteId,
      disposerCount: comparison.length,
      minPrice,
      maxPrice,
      avgPrice: Math.round(avgPrice * 100) / 100, // Redondear a 2 decimales
      prices: comparison,
    };
  }
}
