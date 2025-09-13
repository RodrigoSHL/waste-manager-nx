import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Disposer } from './entities/disposer.entity';
import { DisposerContact } from './entities/disposer-contact.entity';
import { Waste } from './entities/waste.entity';
import { WasteType } from './entities/waste-type.entity';
import { WasteCategory } from './entities/waste-category.entity';
import { Uom } from './entities/uom.entity';
import { Currency } from './entities/currency.entity';
import { DisposerWaste } from './entities/disposer-waste.entity';
import { PriceHistory } from './entities/price-history.entity';

// Repositories
import { MarketPricesRepository } from './repositories/market-prices.repository';

// Services
import { MarketPricesService } from './services/market-prices.service';
import { BulkUploadService } from './services/bulk-upload.service';

// Controllers
import { MarketPricesController } from './market-prices.controller';
import { BulkUploadController } from './controllers/bulk-upload.controller';

// Seeds
import { SeedMarketPrices } from './seed/seed-market-prices';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Disposer,
      DisposerContact,
      Waste,
      WasteType,
      WasteCategory,
      Uom,
      Currency,
      DisposerWaste,
      PriceHistory,
    ]),
  ],
  controllers: [MarketPricesController, BulkUploadController],
  providers: [
    MarketPricesRepository,
    MarketPricesService,
    BulkUploadService,
    SeedMarketPrices,
  ],
  exports: [
    MarketPricesService,
    SeedMarketPrices,
    TypeOrmModule,
  ],
})
export class MarketPricesModule {}
