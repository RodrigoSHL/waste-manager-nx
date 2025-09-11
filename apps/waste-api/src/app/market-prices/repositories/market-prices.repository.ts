import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Disposer } from '../entities/disposer.entity';
import { Waste } from '../entities/waste.entity';
import { WasteType } from '../entities/waste-type.entity';
import { WasteCategory } from '../entities/waste-category.entity';
import { DisposerWaste } from '../entities/disposer-waste.entity';
import { PriceHistory } from '../entities/price-history.entity';
import { CreateWasteDto, UpdateWasteDto } from '../dto/waste.dto';
import { CreateWasteTypeDto } from '../dto/waste-type.dto';
import { CreateWasteCategoryDto } from '../dto/waste-category.dto';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MarketPricesRepository {
  constructor(
    @InjectRepository(Disposer)
    private readonly disposerRepository: Repository<Disposer>,
    @InjectRepository(Waste)
    private readonly wasteRepository: Repository<Waste>,
    @InjectRepository(WasteType)
    private readonly wasteTypeRepository: Repository<WasteType>,
    @InjectRepository(WasteCategory)
    private readonly wasteCategoryRepository: Repository<WasteCategory>,
    @InjectRepository(DisposerWaste)
    private readonly disposerWasteRepository: Repository<DisposerWaste>,
    @InjectRepository(PriceHistory)
    private readonly priceHistoryRepository: Repository<PriceHistory>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Obtiene los últimos precios vigentes de todos los residuos que maneja un dispositor
   */
  async getLatestPricesByDisposer(disposerId: number) {
    return this.priceHistoryRepository
      .createQueryBuilder('ph')
      .innerJoin('ph.disposerWaste', 'dw')
      .innerJoin('dw.disposer', 'd')
      .innerJoin('dw.waste', 'w')
      .innerJoin('dw.uom', 'u')
      .innerJoin('dw.currency', 'c')
      .select([
        'ph.id',
        'ph.price',
        'ph.price_period',
        'ph.source',
        'ph.notes',
        'ph.created_at',
        'w.id',
        'w.code',
        'w.name',
        'u.code',
        'u.description',
        'c.code',
        'c.symbol',
        'dw.min_lot',
        'dw.lead_time_days',
      ])
      .where('d.id = :disposerId', { disposerId })
      .andWhere('dw.is_active = true')
      .andWhere("ph.price_period @> 'now'::timestamptz")
      .orderBy('w.name', 'ASC')
      .getMany();
  }

  /**
   * Obtiene la serie histórica de precios para una combinación dispositor-residuo específica
   */
  async getTimeSeries(disposerId: number, wasteId: number) {
    return this.priceHistoryRepository
      .createQueryBuilder('ph')
      .innerJoin('ph.disposerWaste', 'dw')
      .innerJoin('dw.disposer', 'd')
      .innerJoin('dw.waste', 'w')
      .innerJoin('dw.uom', 'u')
      .innerJoin('dw.currency', 'c')
      .select([
        'ph.id',
        'ph.price',
        'ph.price_period',
        'ph.source',
        'ph.notes',
        'ph.created_at',
        'u.code',
        'c.code',
        'c.symbol',
      ])
      .where('d.id = :disposerId', { disposerId })
      .andWhere('w.id = :wasteId', { wasteId })
      .orderBy('ph.created_at', 'DESC')
      .getMany();
  }

  /**
   * Compara los precios actuales entre dispositores para un residuo específico
   */
  async compareLatestForWaste(wasteId: number) {
    return this.priceHistoryRepository
      .createQueryBuilder('ph')
      .innerJoin('ph.disposerWaste', 'dw')
      .innerJoin('dw.disposer', 'd')
      .innerJoin('dw.waste', 'w')
      .innerJoin('dw.uom', 'u')
      .innerJoin('dw.currency', 'c')
      .select([
        'ph.id',
        'ph.price',
        'ph.price_period',
        'ph.source',
        'ph.created_at',
        'd.id',
        'd.legal_name',
        'd.trade_name',
        'u.code',
        'c.code',
        'c.symbol',
        'dw.min_lot',
        'dw.lead_time_days',
      ])
      .where('w.id = :wasteId', { wasteId })
      .andWhere('dw.is_active = true')
      .andWhere("ph.price_period @> 'now'::timestamptz")
      .orderBy('ph.price', 'DESC')
      .getMany();
  }

  /**
   * Busca la relación dispositor-residuo activa
   */
  async findDisposerWaste(disposerId: number, wasteId: number) {
    return this.disposerWasteRepository.findOne({
      where: {
        disposer_id: disposerId,
        waste_id: wasteId,
        is_active: true,
      },
      relations: ['disposer', 'waste', 'uom', 'currency'],
    });
  }

  /**
   * Cierra el precio vigente actual (si existe) estableciendo el fin del período
   */
  async closeCurrentPrice(disposerWasteId: number, endDate: Date = new Date()) {
    // Buscar el precio actual vigente (sin fecha de fin)
    const currentPrice = await this.priceHistoryRepository
      .createQueryBuilder('ph')
      .where('ph.disposer_waste_id = :disposerWasteId', { disposerWasteId })
      .andWhere("upper_inf(ph.price_period)")
      .getOne();

    if (currentPrice) {
      // Extraer la fecha de inicio del rango actual
      const startDateMatch = currentPrice.price_period.match(/^\[([^,]+),/);
      if (startDateMatch) {
        const startDate = startDateMatch[1];
        const newPeriod = `[${startDate},${endDate.toISOString()})`;
        
        await this.priceHistoryRepository.update(
          { id: currentPrice.id },
          { price_period: newPeriod }
        );
      }
    }
  }

  /**
   * Crea un nuevo registro de precio
   */
  async createPriceHistory(
    disposerWasteId: number,
    price: number,
    startDate: Date = new Date(),
    source?: string,
    notes?: string,
  ) {
    const priceHistory = this.priceHistoryRepository.create({
      disposer_waste_id: disposerWasteId,
      price,
      price_period: `[${startDate.toISOString()},)`,
      source,
      notes,
    });

    return this.priceHistoryRepository.save(priceHistory);
  }

  /**
   * Obtiene todos los dispositores activos
   */
  async findAllDisposers() {
    return this.disposerRepository.find({
      where: { is_active: true },
      relations: ['contacts'],
      order: { legal_name: 'ASC' },
    });
  }

  /**
   * Obtiene todos los residuos
   */
  async findAllWastes() {
    return this.wasteRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtiene vista de últimos precios usando query raw para mejor performance
   */
  async getLatestPricesView() {
    return this.priceHistoryRepository.query(`
      SELECT 
        ph.id,
        ph.price,
        ph.price_period,
        ph.source,
        ph.created_at,
        d.id as disposer_id,
        d.legal_name,
        d.trade_name,
        w.id as waste_id,
        w.code as waste_code,
        w.name as waste_name,
        u.code as uom_code,
        c.code as currency_code,
        c.symbol as currency_symbol,
        dw.min_lot,
        dw.lead_time_days
      FROM price_history ph
      INNER JOIN disposer_wastes dw ON ph.disposer_waste_id = dw.id
      INNER JOIN disposers d ON dw.disposer_id = d.id
      INNER JOIN wastes w ON dw.waste_id = w.id
      INNER JOIN uoms u ON dw.uom_id = u.id
      INNER JOIN currencies c ON dw.currency_id = c.id
      WHERE dw.is_active = true 
        AND ph.price_period @> now()
      ORDER BY w.name, d.legal_name
    `);
  }

  // ===== MÉTODOS CRUD PARA WASTES =====

  /**
   * Busca un residuo por código
   */
  async findWasteByCode(code: string): Promise<Waste | null> {
    return this.wasteRepository.findOne({ where: { code } });
  }

  /**
   * Busca un residuo por nombre
   */
  async findWasteByName(name: string): Promise<Waste | null> {
    return this.wasteRepository.findOne({ where: { name } });
  }

  /**
   * Busca un residuo por ID
   */
  async findWasteById(id: number): Promise<Waste | null> {
    return this.wasteRepository.findOne({ where: { id } });
  }

  /**
   * Crea un nuevo residuo
   */
  async createWaste(createWasteDto: CreateWasteDto): Promise<Waste> {
    const waste = this.wasteRepository.create(createWasteDto);
    return this.wasteRepository.save(waste);
  }

  /**
   * Actualiza un residuo existente
   */
  async updateWaste(id: number, updateWasteDto: UpdateWasteDto): Promise<Waste> {
    await this.wasteRepository.update(id, updateWasteDto);
    const updatedWaste = await this.wasteRepository.findOne({ where: { id } });
    if (!updatedWaste) {
      throw new Error('Residuo no encontrado después de la actualización');
    }
    return updatedWaste;
  }

  /**
   * Elimina un residuo
   */
  async deleteWaste(id: number): Promise<void> {
    await this.wasteRepository.delete(id);
  }

  /**
   * Verifica si un residuo tiene relaciones activas con dispositores
   */
  async hasActiveWasteRelations(wasteId: number): Promise<boolean> {
    const count = await this.disposerWasteRepository.count({
      where: {
        waste_id: wasteId,
        is_active: true,
      },
    });
    return count > 0;
  }

  // ===== MÉTODOS PARA JERARQUÍA DE RESIDUOS =====

  // --- Waste Types ---
  async getAllWasteTypes(): Promise<WasteType[]> {
    return this.wasteTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
      relations: ['categories'],
    });
  }

  async findWasteTypeById(id: number): Promise<WasteType | null> {
    return this.wasteTypeRepository.findOne({
      where: { id },
      relations: ['categories'],
    });
  }

  async findWasteTypeByCode(code: string): Promise<WasteType | null> {
    return this.wasteTypeRepository.findOne({
      where: { code },
    });
  }

  async findWasteTypeByName(name: string): Promise<WasteType | null> {
    return this.wasteTypeRepository.findOne({
      where: { name },
    });
  }

  async createWasteType(createWasteTypeDto: CreateWasteTypeDto): Promise<WasteType> {
    const wasteType = this.wasteTypeRepository.create(createWasteTypeDto);
    return this.wasteTypeRepository.save(wasteType);
  }

  // --- Waste Categories ---
  async getAllWasteCategories(): Promise<WasteCategory[]> {
    return this.wasteCategoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
      relations: ['wasteType', 'wastes'],
    });
  }

  async getWasteCategoriesByType(wasteTypeId: number): Promise<WasteCategory[]> {
    return this.wasteCategoryRepository.find({
      where: { 
        wasteTypeId,
        isActive: true 
      },
      order: { name: 'ASC' },
      relations: ['wastes'],
    });
  }

  async findWasteCategoryById(id: number): Promise<WasteCategory | null> {
    return this.wasteCategoryRepository.findOne({
      where: { id },
      relations: ['wasteType', 'wastes'],
    });
  }

  async findWasteCategoryByCode(code: string): Promise<WasteCategory | null> {
    return this.wasteCategoryRepository.findOne({
      where: { code },
    });
  }

  async findWasteCategoryByName(name: string): Promise<WasteCategory | null> {
    return this.wasteCategoryRepository.findOne({
      where: { name },
    });
  }

  async createWasteCategory(createWasteCategoryDto: CreateWasteCategoryDto): Promise<WasteCategory> {
    const wasteCategory = this.wasteCategoryRepository.create(createWasteCategoryDto);
    return this.wasteCategoryRepository.save(wasteCategory);
  }

  // --- Wastes by Category ---
  async getWastesByCategory(wasteCategoryId: number): Promise<Waste[]> {
    return this.wasteRepository.find({
      where: { 
        wasteCategoryId,
        isActive: true 
      },
      order: { subproductName: 'ASC' },
      relations: ['wasteCategory', 'wasteCategory.wasteType'],
    });
  }

  // --- Hierarchy Views ---
  async getWasteHierarchy() {
    return this.dataSource.query(`
      SELECT 
        wt.id as type_id,
        wt.code as type_code,
        wt.name as type_name,
        wt.color as type_color,
        wt.icon as type_icon,
        wc.id as category_id,
        wc.code as category_code,
        wc.name as category_name,
        wc.technical_specs as category_specs,
        w.id as waste_id,
        w.code as waste_code,
        w.name as waste_name,
        w.subproduct_name,
        w.description as waste_description,
        w.hazard_class,
        w.specifications as waste_specs,
        CONCAT(wt.name, ' > ', wc.name, ' > ', COALESCE(w.subproduct_name, w.name)) as full_hierarchy
      FROM waste_types wt
      LEFT JOIN waste_categories wc ON wt.id = wc.waste_type_id AND wc.is_active = true
      LEFT JOIN wastes w ON wc.id = w.waste_category_id AND w.is_active = true
      WHERE wt.is_active = true
      ORDER BY wt.name, wc.name, w.subproduct_name, w.name
    `);
  }

  // --- Migrations ---
  async runMigrations(): Promise<void> {
    const migrationPath = join(process.cwd(), 'migrations', '1700000000000-init-market-prices.sql');
    
    try {
      const migrationSQL = readFileSync(migrationPath, 'utf8');
      await this.dataSource.query(migrationSQL);
    } catch (error) {
      throw new Error(`Error ejecutando migración de jerarquía: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}
