import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MarketPricesRepository } from '../repositories/market-prices.repository';
import { CreateWasteDto, UpdateWasteDto } from '../dto/waste.dto';
import { CreateWasteTypeDto, UpdateWasteTypeDto } from '../dto/waste-type.dto';
import { CreateWasteCategoryDto, UpdateWasteCategoryDto } from '../dto/waste-category.dto';

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

  /**
   * Crea un nuevo residuo
   */
  async createWaste(createWasteDto: CreateWasteDto) {
    // Verificar que no exista un residuo con el mismo código
    const existingByCode = await this.marketPricesRepository.findWasteByCode(createWasteDto.code);
    if (existingByCode) {
      throw new BadRequestException(`Ya existe un residuo con el código '${createWasteDto.code}'`);
    }

    // Verificar que no exista un residuo con el mismo nombre
    const existingByName = await this.marketPricesRepository.findWasteByName(createWasteDto.name);
    if (existingByName) {
      throw new BadRequestException(`Ya existe un residuo con el nombre '${createWasteDto.name}'`);
    }

    return this.marketPricesRepository.createWaste(createWasteDto);
  }

  /**
   * Actualiza un residuo existente
   */
  async updateWaste(wasteId: number, updateWasteDto: UpdateWasteDto) {
    const waste = await this.marketPricesRepository.findWasteById(wasteId);
    if (!waste) {
      throw new NotFoundException(`Residuo con ID ${wasteId} no encontrado`);
    }

    // Si se actualiza el código, verificar que no exista otro residuo con el mismo código
    if (updateWasteDto.code && updateWasteDto.code !== waste.code) {
      const existingByCode = await this.marketPricesRepository.findWasteByCode(updateWasteDto.code);
      if (existingByCode) {
        throw new BadRequestException(`Ya existe un residuo con el código '${updateWasteDto.code}'`);
      }
    }

    // Si se actualiza el nombre, verificar que no exista otro residuo con el mismo nombre
    if (updateWasteDto.name && updateWasteDto.name !== waste.name) {
      const existingByName = await this.marketPricesRepository.findWasteByName(updateWasteDto.name);
      if (existingByName) {
        throw new BadRequestException(`Ya existe un residuo con el nombre '${updateWasteDto.name}'`);
      }
    }

    return this.marketPricesRepository.updateWaste(wasteId, updateWasteDto);
  }

  /**
   * Elimina un residuo
   */
  async deleteWaste(wasteId: number) {
    const waste = await this.marketPricesRepository.findWasteById(wasteId);
    if (!waste) {
      throw new NotFoundException(`Residuo con ID ${wasteId} no encontrado`);
    }

    // Verificar que no tenga relaciones con dispositores activas
    const hasActiveRelations = await this.marketPricesRepository.hasActiveWasteRelations(wasteId);
    if (hasActiveRelations) {
      throw new BadRequestException(
        'No se puede eliminar el residuo porque tiene relaciones activas con dispositores'
      );
    }

    await this.marketPricesRepository.deleteWaste(wasteId);
    return { message: 'Residuo eliminado exitosamente' };
  }

  /**
   * Obtiene un residuo por ID
   */
  async getWasteById(wasteId: number) {
    const waste = await this.marketPricesRepository.findWasteById(wasteId);
    if (!waste) {
      throw new NotFoundException(`Residuo con ID ${wasteId} no encontrado`);
    }
    return waste;
  }

  // ===== MÉTODOS PARA JERARQUÍA DE RESIDUOS =====

  /**
   * Obtiene todos los tipos de residuos
   */
  async getAllWasteTypes() {
    return this.marketPricesRepository.getAllWasteTypes();
  }

  /**
   * Obtiene un tipo de residuo por ID
   */
  async getWasteTypeById(wasteTypeId: number) {
    const wasteType = await this.marketPricesRepository.findWasteTypeById(wasteTypeId);
    if (!wasteType) {
      throw new NotFoundException(`Tipo de residuo con ID ${wasteTypeId} no encontrado`);
    }
    return wasteType;
  }

  /**
   * Crea un nuevo tipo de residuo
   */
  async createWasteType(createWasteTypeDto: CreateWasteTypeDto) {
    // Verificar que no exista otro tipo con el mismo código
    const existingByCode = await this.marketPricesRepository.findWasteTypeByCode(createWasteTypeDto.code);
    if (existingByCode) {
      throw new BadRequestException(`Ya existe un tipo de residuo con el código '${createWasteTypeDto.code}'`);
    }

    // Verificar que no exista otro tipo con el mismo nombre
    const existingByName = await this.marketPricesRepository.findWasteTypeByName(createWasteTypeDto.name);
    if (existingByName) {
      throw new BadRequestException(`Ya existe un tipo de residuo con el nombre '${createWasteTypeDto.name}'`);
    }

    return this.marketPricesRepository.createWasteType(createWasteTypeDto);
  }

  /**
   * Obtiene todas las categorías de residuos
   */
  async getAllWasteCategories() {
    return this.marketPricesRepository.getAllWasteCategories();
  }

  /**
   * Obtiene categorías de un tipo específico
   */
  async getWasteCategoriesByType(wasteTypeId: number) {
    await this.getWasteTypeById(wasteTypeId); // Esto ya valida que exista
    return this.marketPricesRepository.getWasteCategoriesByType(wasteTypeId);
  }

  /**
   * Obtiene una categoría por ID
   */
  async getWasteCategoryById(wasteCategoryId: number) {
    const wasteCategory = await this.marketPricesRepository.findWasteCategoryById(wasteCategoryId);
    if (!wasteCategory) {
      throw new NotFoundException(`Categoría de residuo con ID ${wasteCategoryId} no encontrada`);
    }
    return wasteCategory;
  }

  /**
   * Crea una nueva categoría de residuo
   */
  async createWasteCategory(createWasteCategoryDto: CreateWasteCategoryDto) {
    // Verificar que el tipo de residuo existe
    await this.getWasteTypeById(createWasteCategoryDto.wasteTypeId); // Esto ya valida que exista

    // Verificar que no exista otra categoría con el mismo código
    const existingByCode = await this.marketPricesRepository.findWasteCategoryByCode(createWasteCategoryDto.code);
    if (existingByCode) {
      throw new BadRequestException(`Ya existe una categoría de residuo con el código '${createWasteCategoryDto.code}'`);
    }

    // Verificar que no exista otra categoría con el mismo nombre
    const existingByName = await this.marketPricesRepository.findWasteCategoryByName(createWasteCategoryDto.name);
    if (existingByName) {
      throw new BadRequestException(`Ya existe una categoría de residuo con el nombre '${createWasteCategoryDto.name}'`);
    }

    return this.marketPricesRepository.createWasteCategory(createWasteCategoryDto);
  }

  /**
   * Obtiene residuos de una categoría específica
   */
  async getWastesByCategory(wasteCategoryId: number) {
    await this.getWasteCategoryById(wasteCategoryId); // Esto ya valida que exista
    return this.marketPricesRepository.getWastesByCategory(wasteCategoryId);
  }

  /**
   * Obtiene la jerarquía completa de residuos
   */
  async getWasteHierarchy() {
    return this.marketPricesRepository.getWasteHierarchy();
  }

  /**
   * Ejecuta las migraciones de base de datos
   */
  async runMigrations() {
    return this.marketPricesRepository.runMigrations();
  }
}
