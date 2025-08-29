import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disposer } from '../entities/disposer.entity';
import { DisposerContact } from '../entities/disposer-contact.entity';
import { Waste } from '../entities/waste.entity';
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
    @InjectRepository(DisposerWaste)
    private readonly disposerWasteRepository: Repository<DisposerWaste>,
    @InjectRepository(PriceHistory)
    private readonly priceHistoryRepository: Repository<PriceHistory>,
  ) {}

  async run() {
    console.log('🌱 Iniciando seeds de Market Prices...');

    // 1. Seed UOMs
    await this.seedUoms();

    // 2. Seed Currencies
    await this.seedCurrencies();

    // 3. Seed Disposers
    await this.seedDisposers();

    // 4. Seed Wastes
    await this.seedWastes();

    // 5. Seed DisposerWastes (relaciones)
    await this.seedDisposerWastes();

    // 6. Seed Price History
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
            contact_name: 'Juan Pérez',
            email: 'juan.perez@bravo-energy.cl',
            phone: '+56912345678',
            role: 'Gerente Comercial',
            is_primary: true,
          },
          {
            contact_name: 'María González',
            email: 'maria.gonzalez@bravo-energy.cl',
            phone: '+56987654321',
            role: 'Coordinadora de Residuos',
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
            contact_name: 'Carlos Silva',
            email: 'carlos.silva@rbf.cl',
            phone: '+56911111111',
            role: 'Director General',
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
            contact_name: 'Ana Rodríguez',
            email: 'ana.rodriguez@ecowaste.cl',
            phone: '+56922222222',
            role: 'Gerente de Operaciones',
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
    const wastes = [
      {
        code: 'PLASTIC-001',
        name: 'Plástico PET',
        description: 'Plástico polietileno tereftalato (botellas)',
        hazard_class: undefined,
      },
      {
        code: 'BATTERY-001',
        name: 'Baterías de Plomo',
        description: 'Baterías de plomo-ácido usadas',
        hazard_class: 'H8',
      },
      {
        code: 'METAL-001',
        name: 'Chatarra de Cobre',
        description: 'Restos de cobre y aleaciones',
        hazard_class: undefined,
      },
      {
        code: 'PAPER-001',
        name: 'Papel y Cartón',
        description: 'Papel y cartón para reciclaje',
        hazard_class: undefined,
      },
      {
        code: 'OIL-001',
        name: 'Aceite Usado',
        description: 'Aceites lubricantes usados',
        hazard_class: 'H5',
      },
    ];

    for (const wasteData of wastes) {
      const existing = await this.wasteRepository.findOne({
        where: { code: wasteData.code },
      });

      if (!existing) {
        const waste = this.wasteRepository.create(wasteData);
        await this.wasteRepository.save(waste);
        console.log(`  ✓ Residuo creado: ${wasteData.name}`);
      }
    }
  }

  private async seedDisposerWastes() {
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

    const plastic = await this.wasteRepository.findOne({
      where: { code: 'PLASTIC-001' },
    });
    const batteries = await this.wasteRepository.findOne({
      where: { code: 'BATTERY-001' },
    });
    const copper = await this.wasteRepository.findOne({
      where: { code: 'METAL-001' },
    });
    const paper = await this.wasteRepository.findOne({
      where: { code: 'PAPER-001' },
    });
    const oil = await this.wasteRepository.findOne({
      where: { code: 'OIL-001' },
    });

    const tonUom = await this.uomRepository.findOne({ where: { code: 'ton' } });
    const kgUom = await this.uomRepository.findOne({ where: { code: 'kg' } });
    const ltUom = await this.uomRepository.findOne({ where: { code: 'lt' } });

    const clpCurrency = await this.currencyRepository.findOne({
      where: { code: 'CLP' },
    });

    const relations = [
      // Bravo Energy
      {
        disposer: bravoEnergy,
        waste: plastic,
        uom: tonUom,
        currency: clpCurrency,
        min_lot: 5,
        lead_time_days: 7,
        notes: 'Acepta mínimo 5 toneladas',
      },
      {
        disposer: bravoEnergy,
        waste: batteries,
        uom: kgUom,
        currency: clpCurrency,
        min_lot: 100,
        lead_time_days: 3,
        notes: 'Procesamiento especializado',
      },
      {
        disposer: bravoEnergy,
        waste: copper,
        uom: kgUom,
        currency: clpCurrency,
        min_lot: 50,
        lead_time_days: 2,
        notes: 'Pago inmediato',
      },
      // RBF Recycling
      {
        disposer: rbfRecycling,
        waste: plastic,
        uom: tonUom,
        currency: clpCurrency,
        min_lot: 10,
        lead_time_days: 10,
        notes: 'Volúmenes grandes',
      },
      {
        disposer: rbfRecycling,
        waste: paper,
        uom: tonUom,
        currency: clpCurrency,
        min_lot: 2,
        lead_time_days: 5,
        notes: 'Papel limpio únicamente',
      },
      // EcoWaste
      {
        disposer: ecoWaste,
        waste: oil,
        uom: ltUom,
        currency: clpCurrency,
        min_lot: 1000,
        lead_time_days: 15,
        notes: 'Servicio de retiro incluido',
      },
      {
        disposer: ecoWaste,
        waste: batteries,
        uom: kgUom,
        currency: clpCurrency,
        min_lot: 200,
        lead_time_days: 7,
        notes: 'Certificado de disposición',
      },
    ];

    for (const relationData of relations) {
      if (
        !relationData.disposer ||
        !relationData.waste ||
        !relationData.uom ||
        !relationData.currency
      ) {
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
    const disposerWastes = await this.disposerWasteRepository.find({
      relations: ['disposer', 'waste'],
    });

    // Dates para el historial (últimos 6 meses)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);

    const priceData = [
      // Bravo Energy - Plástico: 3000 -> 4000
      {
        disposer_rut: '76.123.456-7',
        waste_code: 'PLASTIC-001',
        prices: [
          { price: 3000, start: sixMonthsAgo, end: threeMonthsAgo, source: 'Cotización inicial' },
          { price: 4000, start: threeMonthsAgo, end: null, source: 'Actualización trimestral' },
        ],
      },
      // RBF Recycling - Plástico: 4000 -> 3000
      {
        disposer_rut: '78.987.654-3',
        waste_code: 'PLASTIC-001',
        prices: [
          { price: 4000, start: sixMonthsAgo, end: threeMonthsAgo, source: 'Precio base' },
          { price: 3000, start: threeMonthsAgo, end: null, source: 'Ajuste por mercado' },
        ],
      },
      // Bravo Energy - Baterías: 350 -> 370
      {
        disposer_rut: '76.123.456-7',
        waste_code: 'BATTERY-001',
        prices: [
          { price: 350, start: sixMonthsAgo, end: threeMonthsAgo, source: 'Precio estándar' },
          { price: 370, start: threeMonthsAgo, end: null, source: 'Incremento por demanda' },
        ],
      },
      // Bravo Energy - Cobre: 8500 -> 9200
      {
        disposer_rut: '76.123.456-7',
        waste_code: 'METAL-001',
        prices: [
          { price: 8500, start: sixMonthsAgo, end: threeMonthsAgo, source: 'Precio LME base' },
          { price: 9200, start: threeMonthsAgo, end: null, source: 'Alza internacional' },
        ],
      },
      // RBF Recycling - Papel: 150 -> 180
      {
        disposer_rut: '78.987.654-3',
        waste_code: 'PAPER-001',
        prices: [
          { price: 150, start: sixMonthsAgo, end: threeMonthsAgo, source: 'Precio mercado local' },
          { price: 180, start: threeMonthsAgo, end: null, source: 'Mayor demanda' },
        ],
      },
      // EcoWaste - Aceite: 50 -> 60
      {
        disposer_rut: '79.555.666-8',
        waste_code: 'OIL-001',
        prices: [
          { price: 50, start: sixMonthsAgo, end: threeMonthsAgo, source: 'Tarifa estándar' },
          { price: 60, start: threeMonthsAgo, end: null, source: 'Ajuste por costos' },
        ],
      },
      // EcoWaste - Baterías: 320 actual
      {
        disposer_rut: '79.555.666-8',
        waste_code: 'BATTERY-001',
        prices: [
          { price: 320, start: threeMonthsAgo, end: null, source: 'Precio competitivo' },
        ],
      },
    ];

    for (const item of priceData) {
      const disposerWaste = disposerWastes.find(
        (dw) =>
          dw.disposer.rut === item.disposer_rut &&
          dw.waste.code === item.waste_code,
      );

      if (!disposerWaste) continue;

      for (const priceInfo of item.prices) {
        const period = priceInfo.end 
          ? `[${priceInfo.start.toISOString()},${priceInfo.end.toISOString()})`
          : `[${priceInfo.start.toISOString()},)`;

        const existing = await this.priceHistoryRepository.findOne({
          where: {
            disposer_waste_id: disposerWaste.id,
            price_period: period,
          },
        });

        if (!existing) {
          const priceHistory = this.priceHistoryRepository.create({
            disposer_waste_id: disposerWaste.id,
            price: priceInfo.price,
            price_period: period,
            source: priceInfo.source,
            notes: `Precio histórico generado por seed`,
          });

          await this.priceHistoryRepository.save(priceHistory);
        }
      }

      console.log(
        `  ✓ Historial de precios creado: ${disposerWaste.disposer.trade_name} - ${disposerWaste.waste.name}`,
      );
    }
  }
}
