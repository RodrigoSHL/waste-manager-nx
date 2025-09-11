import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disposer } from '../entities/disposer.entity';
import { DisposerContact } from '../entities/disposer-contact.entity';
import { Waste } from '../entities/waste.entity';
import { WasteType } from '../entities/waste-type.entity';
import { WasteCategory } from '../entities/waste-category.entity';
import { Uom } from '../entities/uom.entity';
import { Currency } from '../entities/currency.entity';
import { DisposerWaste } from '../entities/disposer-waste.entity';
import { PriceHistory } from '../entities/price-history.entity';

@Injectable()
export class SeedMarketPrices {
  constructor(
    @InjectRepository(Uom)
    private readonly uomRepository: Repository<Uom>,
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    @InjectRepository(Disposer)
    private readonly disposerRepository: Repository<Disposer>,
    @InjectRepository(DisposerContact)
    private readonly disposerContactRepository: Repository<DisposerContact>,
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
  ) {}

  async run() {
    console.log('🌱 Iniciando seeds de Market Prices...');

    // Verificar si la migración ya se ejecutó y tenemos datos base
    const uomCount = await this.uomRepository.count();
    const currencyCount = await this.currencyRepository.count();
    
    if (uomCount === 0 || currencyCount === 0) {
      console.log('⚠️  No se encontraron datos base. Ejecuta la migración primero.');
      // 1. Seed UOMs (solo si no existen)
      await this.seedUoms();
      // 2. Seed Currencies (solo si no existen)
      await this.seedCurrencies();
    } else {
      console.log('✓ Datos base ya existen (UOMs, Currencies, WasteTypes, WasteCategories)');
    }

    // 3. Seed Disposers (empresas ejemplo)
    await this.seedDisposers();

    // 4. Seed Wastes (residuos específicos)
    await this.seedWastes();

    // 5. Seed DisposerWastes (relaciones)
    await this.seedDisposerWastes();

    // 6. Seed Price History (precios ejemplo)
    await this.seedPriceHistory();

    console.log('✅ Seeds de Market Prices completados exitosamente');
  }

  private async seedUoms() {
    const uoms = [
      { code: 'kg', description: 'Kilogramo' },
      { code: 'ton', description: 'Tonelada' },
      { code: 'lt', description: 'Litro' },
      { code: 'm3', description: 'Metro cúbico' },
      { code: 'unit', description: 'Unidad' },
    ];

    for (const uomData of uoms) {
      const existing = await this.uomRepository.findOne({
        where: { code: uomData.code },
      });

      if (!existing) {
        const uom = this.uomRepository.create(uomData);
        await this.uomRepository.save(uom);
        console.log(`  ✓ UOM creado: ${uomData.code}`);
      }
    }
  }

  private async seedCurrencies() {
    const currencies = [
      { code: 'CLP', symbol: '$', decimals: 0 },
      { code: 'UF', symbol: 'UF', decimals: 2 },
      { code: 'USD', symbol: 'US$', decimals: 2 },
    ];

    for (const currencyData of currencies) {
      const existing = await this.currencyRepository.findOne({
        where: { code: currencyData.code },
      });

      if (!existing) {
        const currency = this.currencyRepository.create(currencyData);
        await this.currencyRepository.save(currency);
        console.log(`  ✓ Moneda creada: ${currencyData.code}`);
      }
    }
  }

  private async seedDisposers() {
    const disposers = [
      {
        legal_name: 'Bravo Energy SpA',
        trade_name: 'Bravo Energy',
        rut: '76.123.456-7',
        website: 'https://bravo-energy.cl',
        is_active: true,
        contacts: [
          {
            name: 'Juan Pérez',
            position: 'Gerente Comercial',
            email: 'juan.perez@bravo-energy.cl',
            phone: '+56912345678',
            is_primary: true,
          },
          {
            name: 'María González',
            position: 'Coordinadora de Residuos',
            email: 'maria.gonzalez@bravo-energy.cl',
            phone: '+56987654321',
            is_primary: false,
          },
        ],
      },
      {
        legal_name: 'RBF Recycling Ltda',
        trade_name: 'RBF Recycling',
        rut: '78.987.654-3',
        website: 'https://rbf-recycling.cl',
        is_active: true,
        contacts: [
          {
            name: 'Carlos Silva',
            position: 'Director General',
            email: 'carlos.silva@rbf.cl',
            phone: '+56911111111',
            is_primary: true,
          },
        ],
      },
      {
        legal_name: 'EcoWaste Solutions SA',
        trade_name: 'EcoWaste',
        rut: '79.555.666-8',
        website: 'https://ecowaste.cl',
        is_active: true,
        contacts: [
          {
            name: 'Ana Rodríguez',
            position: 'Gerente de Operaciones',
            email: 'ana.rodriguez@ecowaste.cl',
            phone: '+56922222222',
            is_primary: true,
          },
        ],
      },
    ];

    for (const disposerData of disposers) {
      const { contacts, ...disposerInfo } = disposerData;
      
      const existing = await this.disposerRepository.findOne({
        where: { rut: disposerInfo.rut },
      });

      if (!existing) {
        const disposer = this.disposerRepository.create(disposerInfo);
        const savedDisposer = await this.disposerRepository.save(disposer);

        // Crear contactos
        for (const contactData of contacts) {
          const contact = this.disposerContactRepository.create({
            ...contactData,
            disposer_id: savedDisposer.id,
          });
          await this.disposerContactRepository.save(contact);
        }

        console.log(`  ✓ Dispositor creado: ${disposerInfo.legal_name}`);
      }
    }
  }

  private async seedWastes() {
    console.log('  🗂️ Creando residuos específicos con jerarquía...');

    // Obtener categorías existentes (creadas por la migración)
    const petCategory = await this.wasteCategoryRepository.findOne({
      where: { code: 'PET' }
    });
    
    const leadAcidCategory = await this.wasteCategoryRepository.findOne({
      where: { code: 'LEAD_ACID' }
    });
    
    const copperCategory = await this.wasteCategoryRepository.findOne({
      where: { code: 'COPPER' }
    });
    
    const cardboardCategory = await this.wasteCategoryRepository.findOne({
      where: { code: 'CARDBOARD' }
    });

    if (!petCategory || !leadAcidCategory || !copperCategory || !cardboardCategory) {
      console.log('  ⚠️  Error: No se encontraron las categorías necesarias. Ejecuta la migración primero.');
      return;
    }

    const wastes = [
      {
        code: 'PET-BOTTLE-DRINK',
        name: 'Botella PET Bebida',
        subproductName: 'Botella de bebida',
        description: 'Botellas PET transparentes de bebidas (500ml-2L)',
        hazardClass: undefined,
        wasteCategoryId: petCategory.id,
        specifications: {
          capacity_range: '500ml-2L',
          color: 'transparent',
          closure_type: 'screw_cap',
          typical_weight: '20-50g'
        },
        isActive: true
      },
      {
        code: 'PET-CONTAINER-FOOD',
        name: 'Envase PET Alimentario',
        subproductName: 'Envase de comida',
        description: 'Envases PET para productos alimentarios',
        hazardClass: undefined,
        wasteCategoryId: petCategory.id,
        specifications: {
          food_grade: true,
          shapes: ['rectangular', 'round'],
          typical_weight: '15-40g'
        },
        isActive: true
      },
      {
        code: 'LEAD-BATTERY-AUTO',
        name: 'Batería Automotriz',
        subproductName: 'Batería de automóvil',
        description: 'Baterías de plomo-ácido de vehículos',
        hazardClass: 'H8',
        wasteCategoryId: leadAcidCategory.id,
        specifications: {
          voltage: '12V',
          typical_weight: '15-25kg',
          lead_content: '60-70%',
          electrolyte: 'sulfuric_acid'
        },
        isActive: true
      },
      {
        code: 'COPPER-WIRE-CLEAN',
        name: 'Cable de Cobre Limpio',
        subproductName: 'Cable sin aislante',
        description: 'Cables de cobre sin aislamiento plástico',
        hazardClass: undefined,
        wasteCategoryId: copperCategory.id,
        specifications: {
          purity: '99%',
          condition: 'clean',
          typical_diameter: '1-10mm'
        },
        isActive: true
      },
      {
        code: 'COPPER-PIPE-USED',
        name: 'Tubería de Cobre',
        subproductName: 'Tubería usada',
        description: 'Tuberías de cobre de instalaciones',
        hazardClass: undefined,
        wasteCategoryId: copperCategory.id,
        specifications: {
          purity: '95-99%',
          condition: 'used',
          typical_diameter: '15-50mm'
        },
        isActive: true
      },
      {
        code: 'CARDBOARD-BOX-CORRUGATED',
        name: 'Cartón Corrugado',
        subproductName: 'Caja corrugada',
        description: 'Cajas de cartón corrugado para empaque',
        hazardClass: undefined,
        wasteCategoryId: cardboardCategory.id,
        specifications: {
          type: 'corrugated',
          condition: 'clean_dry',
          contamination_max: '5%'
        },
        isActive: true
      }
    ];

    for (const wasteData of wastes) {
      const existing = await this.wasteRepository.findOne({
        where: { code: wasteData.code },
      });

      if (!existing) {
        const waste = this.wasteRepository.create({
          code: wasteData.code,
          name: wasteData.name,
          subproductName: wasteData.subproductName,
          description: wasteData.description,
          hazardClass: wasteData.hazardClass,
          wasteCategoryId: wasteData.wasteCategoryId,
          specifications: wasteData.specifications,
          isActive: wasteData.isActive
        });
        await this.wasteRepository.save(waste);
        console.log(`    ✓ Residuo creado: ${wasteData.name} (${wasteData.subproductName})`);
      } else {
        console.log(`    • Residuo ya existe: ${wasteData.name}`);
      }
    }
  }

  private async seedDisposerWastes() {
    console.log('  🔗 Creando relaciones dispositor-residuo...');
    
    // Obtener entidades necesarias
    const bravoEnergy = await this.disposerRepository.findOne({
      where: { rut: '76.123.456-7' },
    });
    const rbfRecycling = await this.disposerRepository.findOne({
      where: { rut: '78.987.654-3' },
    });
    const ecoWaste = await this.disposerRepository.findOne({
      where: { rut: '79.555.666-8' },
    });

    // Buscar residuos con los nuevos códigos
    const petBottle = await this.wasteRepository.findOne({
      where: { code: 'PET-BOTTLE-DRINK' },
    });
    const petContainer = await this.wasteRepository.findOne({
      where: { code: 'PET-CONTAINER-FOOD' },
    });
    const leadBattery = await this.wasteRepository.findOne({
      where: { code: 'LEAD-BATTERY-AUTO' },
    });
    const copperWire = await this.wasteRepository.findOne({
      where: { code: 'COPPER-WIRE-CLEAN' },
    });
    const copperPipe = await this.wasteRepository.findOne({
      where: { code: 'COPPER-PIPE-USED' },
    });
    const cardboard = await this.wasteRepository.findOne({
      where: { code: 'CARDBOARD-BOX-CORRUGATED' },
    });

    const tonUom = await this.uomRepository.findOne({ where: { code: 'ton' } });
    const kgUom = await this.uomRepository.findOne({ where: { code: 'kg' } });

    const clpCurrency = await this.currencyRepository.findOne({
      where: { code: 'CLP' },
    });

    if (!bravoEnergy || !rbfRecycling || !ecoWaste || !clpCurrency || !tonUom || !kgUom) {
      console.log('  ⚠️  Error: No se encontraron las entidades base necesarias');
      return;
    }

    const relations = [
      // Bravo Energy - especializado en plásticos y metales
      {
        disposer: bravoEnergy,
        waste: petBottle,
        uom: tonUom,
        currency: clpCurrency,
        min_lot: 5,
        lead_time_days: 7,
        notes: 'Acepta botellas PET limpias, mínimo 5 toneladas',
      },
      {
        disposer: bravoEnergy,
        waste: petContainer,
        uom: tonUom,
        currency: clpCurrency,
        min_lot: 3,
        lead_time_days: 7,
        notes: 'Envases alimentarios, sin etiquetas preferible',
      },
      {
        disposer: bravoEnergy,
        waste: copperWire,
        uom: kgUom,
        currency: clpCurrency,
        min_lot: 50,
        lead_time_days: 2,
        notes: 'Cable limpio sin aislante, pago inmediato',
      },
      
      // RBF Recycling - maneja diversos materiales
      {
        disposer: rbfRecycling,
        waste: petBottle,
        uom: tonUom,
        currency: clpCurrency,
        min_lot: 10,
        lead_time_days: 10,
        notes: 'Volúmenes grandes, mejor precio por cantidad',
      },
      {
        disposer: rbfRecycling,
        waste: cardboard,
        uom: tonUom,
        currency: clpCurrency,
        min_lot: 2,
        lead_time_days: 5,
        notes: 'Cartón limpio y seco',
      },
      {
        disposer: rbfRecycling,
        waste: copperPipe,
        uom: kgUom,
        currency: clpCurrency,
        min_lot: 100,
        lead_time_days: 3,
        notes: 'Tubería usada, acepta con soldaduras',
      },
      
      // EcoWaste - especializado en baterías y metales
      {
        disposer: ecoWaste,
        waste: leadBattery,
        uom: kgUom,
        currency: clpCurrency,
        min_lot: 100,
        lead_time_days: 3,
        notes: 'Procesamiento especializado de baterías',
      },
      {
        disposer: ecoWaste,
        waste: copperWire,
        uom: kgUom,
        currency: clpCurrency,
        min_lot: 25,
        lead_time_days: 1,
        notes: 'Procesamiento rápido, pago al contado',
      },
      {
        disposer: ecoWaste,
        waste: copperPipe,
        uom: kgUom,
        currency: clpCurrency,
        min_lot: 50,
        lead_time_days: 2,
        notes: 'Separación automática de materiales',
      }
    ];

    for (const relationData of relations) {
      if (
        !relationData.disposer ||
        !relationData.waste ||
        !relationData.uom ||
        !relationData.currency
      ) {
        console.log('    ⚠️  Saltando relación incompleta');
        continue;
      }

      const existing = await this.disposerWasteRepository.findOne({
        where: {
          disposer_id: relationData.disposer.id,
          waste_id: relationData.waste.id,
        },
      });

      if (!existing) {
        const disposerWaste = this.disposerWasteRepository.create({
          disposer_id: relationData.disposer.id,
          waste_id: relationData.waste.id,
          uom_id: relationData.uom.id,
          currency_id: relationData.currency.id,
          min_lot: relationData.min_lot,
          lead_time_days: relationData.lead_time_days,
          notes: relationData.notes,
          is_active: true,
        });

        await this.disposerWasteRepository.save(disposerWaste);
        console.log(
          `  ✓ Relación creada: ${relationData.disposer.trade_name} - ${relationData.waste.name}`,
        );
      }
    }
  }

  private async seedPriceHistory() {
    console.log('  📈 Creando historial de precios...');
    
    const disposerWastes = await this.disposerWasteRepository.find({
      relations: ['disposer', 'waste'],
    });

    // Dates para el historial (últimos 6 meses)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);

    const priceData = [
      // Bravo Energy - Botellas PET: 3000 -> 4000 CLP/ton
      {
        disposer_rut: '76.123.456-7',
        waste_code: 'PET-BOTTLE-DRINK',
        prices: [
          { price: 3000, start: sixMonthsAgo, end: threeMonthsAgo, source: 'Cotización inicial botellas PET' },
          { price: 4000, start: threeMonthsAgo, end: null, source: 'Actualización por alta demanda' },
        ],
      },
      // Bravo Energy - Envases PET: 2800 -> 3500 CLP/ton
      {
        disposer_rut: '76.123.456-7',
        waste_code: 'PET-CONTAINER-FOOD',
        prices: [
          { price: 2800, start: sixMonthsAgo, end: threeMonthsAgo, source: 'Precio base envases alimentarios' },
          { price: 3500, start: threeMonthsAgo, end: null, source: 'Incremento por calidad' },
        ],
      },
      // RBF Recycling - Botellas PET: 4000 -> 3000 CLP/ton
      {
        disposer_rut: '78.987.654-3',
        waste_code: 'PET-BOTTLE-DRINK',
        prices: [
          { price: 4000, start: sixMonthsAgo, end: threeMonthsAgo, source: 'Precio competitivo inicial' },
          { price: 3000, start: threeMonthsAgo, end: null, source: 'Ajuste por exceso de oferta' },
        ],
      },
      // Bravo Energy - Cable Cobre Limpio: 8500 -> 9200 CLP/kg
      {
        disposer_rut: '76.123.456-7',
        waste_code: 'COPPER-WIRE-CLEAN',
        prices: [
          { price: 8500, start: sixMonthsAgo, end: threeMonthsAgo, source: 'Precio LME base cable limpio' },
          { price: 9200, start: threeMonthsAgo, end: null, source: 'Alza internacional del cobre' },
        ],
      },
      // EcoWaste - Cable Cobre Limpio: 8300 -> 9000 CLP/kg
      {
        disposer_rut: '79.555.666-8',
        waste_code: 'COPPER-WIRE-CLEAN',
        prices: [
          { price: 8300, start: sixMonthsAgo, end: threeMonthsAgo, source: 'Precio competitivo cable' },
          { price: 9000, start: threeMonthsAgo, end: null, source: 'Seguimiento mercado internacional' },
        ],
      },
      // RBF Recycling - Tubería Cobre: 7800 -> 8200 CLP/kg
      {
        disposer_rut: '78.987.654-3',
        waste_code: 'COPPER-PIPE-USED',
        prices: [
          { price: 7800, start: sixMonthsAgo, end: threeMonthsAgo, source: 'Precio tubería con soldaduras' },
          { price: 8200, start: threeMonthsAgo, end: null, source: 'Incremento por procesamiento' },
        ],
      },
      // EcoWaste - Baterías Plomo: 350 -> 380 CLP/kg
      {
        disposer_rut: '79.555.666-8',
        waste_code: 'LEAD-BATTERY-AUTO',
        prices: [
          { price: 350, start: sixMonthsAgo, end: threeMonthsAgo, source: 'Precio estándar baterías auto' },
          { price: 380, start: threeMonthsAgo, end: null, source: 'Incremento por demanda plomo' },
        ],
      },
      // RBF Recycling - Cartón: 150 -> 180 CLP/ton
      {
        disposer_rut: '78.987.654-3',
        waste_code: 'CARDBOARD-BOX-CORRUGATED',
        prices: [
          { price: 150, start: sixMonthsAgo, end: threeMonthsAgo, source: 'Precio base cartón corrugado' },
          { price: 180, start: threeMonthsAgo, end: null, source: 'Alza por escasez papel' },
        ],
      }
    ];

    for (const item of priceData) {
      const disposerWaste = disposerWastes.find(
        (dw) =>
          dw.disposer.rut === item.disposer_rut &&
          dw.waste.code === item.waste_code
      );

      if (!disposerWaste) {
        console.log(`    ⚠️  No se encontró relación para ${item.disposer_rut} - ${item.waste_code}`);
        continue;
      }

      for (const priceInfo of item.prices) {
        const existing = await this.priceHistoryRepository.findOne({
          where: {
            disposer_waste_id: disposerWaste.id,
            price_period: `[${priceInfo.start.toISOString()},${priceInfo.end?.toISOString() || ''})`,
          },
        });

        if (!existing) {
          const priceHistory = this.priceHistoryRepository.create({
            disposer_waste_id: disposerWaste.id,
            price: priceInfo.price,
            price_period: `[${priceInfo.start.toISOString()},${priceInfo.end?.toISOString() || ''})`,
            source: priceInfo.source,
            notes: `Precio histórico para ${disposerWaste.waste.name}`,
          });

          await this.priceHistoryRepository.save(priceHistory);
          console.log(`    ✓ Precio creado: ${disposerWaste.disposer.trade_name} - ${disposerWaste.waste.name}: $${priceInfo.price}`);
        } else {
          console.log(`    • Precio ya existe: ${disposerWaste.disposer.trade_name} - ${disposerWaste.waste.name}`);
        }
      }
    }
  }
}
