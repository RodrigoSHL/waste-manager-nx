import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MarketPricesService } from './services/market-prices.service';
import { SeedMarketPrices } from './seed/seed-market-prices';
import { CreateWasteDto, UpdateWasteDto } from './dto/waste.dto';
import { CreateWasteTypeDto, UpdateWasteTypeDto } from './dto/waste-type.dto';
import { CreateWasteCategoryDto, UpdateWasteCategoryDto } from './dto/waste-category.dto';

@Controller('market-prices')
export class MarketPricesController {
  constructor(
    private readonly marketPricesService: MarketPricesService,
    private readonly seedMarketPrices: SeedMarketPrices,
  ) {}

  /**
   * Obtiene todos los dispositores activos
   */
  @Get('disposers')
  async getDisposers() {
    return this.marketPricesService.getAllDisposers();
  }

  /**
   * Obtiene todos los residuos
   */
  @Get('wastes')
  async getWastes() {
    return this.marketPricesService.getAllWastes();
  }

  /**
   * Obtiene los precios actuales de un dispositor
   */
  @Get('disposers/:id/prices')
  async getDisposerPrices(@Param('id', ParseIntPipe) disposerId: number) {
    try {
      return await this.marketPricesService.getLatestPricesByDisposer(disposerId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Obtiene el historial de precios para una combinación específica
   */
  @Get('disposers/:disposerId/wastes/:wasteId/history')
  async getTimeSeries(
    @Param('disposerId', ParseIntPipe) disposerId: number,
    @Param('wasteId', ParseIntPipe) wasteId: number,
  ) {
    try {
      return await this.marketPricesService.getTimeSeries(disposerId, wasteId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Compara precios entre dispositores para un residuo
   */
  @Get('wastes/:id/comparison')
  async compareWastePrices(@Param('id', ParseIntPipe) wasteId: number) {
    try {
      return await this.marketPricesService.compareLatestForWaste(wasteId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Obtiene estadísticas de un residuo
   */
  @Get('wastes/:id/stats')
  async getWasteStats(@Param('id', ParseIntPipe) wasteId: number) {
    return await this.marketPricesService.getWastePriceStats(wasteId);
  }

  /**
   * Obtiene una vista general de todos los precios actuales
   */
  @Get('overview')
  async getPricesOverview() {
    return await this.marketPricesService.getLatestPricesOverview();
  }

  /**
   * Actualiza el precio para una combinación dispositor-residuo
   */
  @Post('disposers/:disposerId/wastes/:wasteId/price')
  async updatePrice(
    @Param('disposerId', ParseIntPipe) disposerId: number,
    @Param('wasteId', ParseIntPipe) wasteId: number,
    @Body() updatePriceDto: {
      price: number;
      source?: string;
      notes?: string;
    },
  ) {
    try {
      return await this.marketPricesService.upsertNewPrice(
        disposerId,
        wasteId,
        updatePriceDto.price,
        updatePriceDto.source,
        updatePriceDto.notes,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST;
      throw new HttpException(message, status);
    }
  }

  /**
   * Ejecuta los seeds de datos de ejemplo
   */
  @Post('seed')
  async runSeeds() {
    try {
      await this.seedMarketPrices.run();
      return { message: 'Seeds ejecutados exitosamente' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(
        `Error ejecutando seeds: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===== ENDPOINTS CRUD PARA WASTES =====

  /**
   * Crea un nuevo residuo
   */
  @Post('wastes')
  async createWaste(@Body() createWasteDto: CreateWasteDto) {
    try {
      return await this.marketPricesService.createWaste(createWasteDto);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST;
      throw new HttpException(message, status);
    }
  }

  /**
   * Obtiene un residuo por ID
   */
  @Get('wastes/:id')
  async getWasteById(@Param('id', ParseIntPipe) wasteId: number) {
    try {
      return await this.marketPricesService.getWasteById(wasteId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Actualiza un residuo existente
   */
  @Put('wastes/:id')
  async updateWaste(
    @Param('id', ParseIntPipe) wasteId: number,
    @Body() updateWasteDto: UpdateWasteDto,
  ) {
    try {
      return await this.marketPricesService.updateWaste(wasteId, updateWasteDto);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST;
      throw new HttpException(message, status);
    }
  }

  /**
   * Elimina un residuo
   */
  @Delete('wastes/:id')
  async deleteWaste(@Param('id', ParseIntPipe) wasteId: number) {
    try {
      return await this.marketPricesService.deleteWaste(wasteId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST;
      throw new HttpException(message, status);
    }
  }

  // ===== ENDPOINTS PARA JERARQUÍA DE RESIDUOS =====

  /**
   * Obtiene todos los tipos de residuos
   */
  @Get('waste-types')
  async getWasteTypes() {
    return this.marketPricesService.getAllWasteTypes();
  }

  /**
   * Obtiene un tipo de residuo por ID
   */
  @Get('waste-types/:id')
  async getWasteTypeById(@Param('id', ParseIntPipe) wasteTypeId: number) {
    try {
      return await this.marketPricesService.getWasteTypeById(wasteTypeId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Crea un nuevo tipo de residuo
   */
  @Post('waste-types')
  async createWasteType(@Body() createWasteTypeDto: CreateWasteTypeDto) {
    try {
      return await this.marketPricesService.createWasteType(createWasteTypeDto);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Obtiene categorías de un tipo de residuo
   */
  @Get('waste-types/:id/categories')
  async getWasteTypeCategories(@Param('id', ParseIntPipe) wasteTypeId: number) {
    try {
      return await this.marketPricesService.getWasteCategoriesByType(wasteTypeId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Obtiene todas las categorías de residuos
   */
  @Get('waste-categories')
  async getWasteCategories() {
    return this.marketPricesService.getAllWasteCategories();
  }

  /**
   * Obtiene una categoría de residuo por ID
   */
  @Get('waste-categories/:id')
  async getWasteCategoryById(@Param('id', ParseIntPipe) wasteCategoryId: number) {
    try {
      return await this.marketPricesService.getWasteCategoryById(wasteCategoryId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Crea una nueva categoría de residuo
   */
  @Post('waste-categories')
  async createWasteCategory(@Body() createWasteCategoryDto: CreateWasteCategoryDto) {
    try {
      return await this.marketPricesService.createWasteCategory(createWasteCategoryDto);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Obtiene residuos de una categoría específica
   */
  @Get('waste-categories/:id/wastes')
  async getWastesByCategory(@Param('id', ParseIntPipe) wasteCategoryId: number) {
    try {
      return await this.marketPricesService.getWastesByCategory(wasteCategoryId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Obtiene la jerarquía completa de residuos
   */
  @Get('waste-hierarchy')
  async getWasteHierarchy() {
    return this.marketPricesService.getWasteHierarchy();
  }

  /**
   * Ejecuta las migraciones de base de datos
   */
  @Post('migrate')
  async runMigrations() {
    try {
      await this.marketPricesService.runMigrations();
      return { message: 'Migraciones ejecutadas exitosamente' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(
        `Error ejecutando migraciones: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
