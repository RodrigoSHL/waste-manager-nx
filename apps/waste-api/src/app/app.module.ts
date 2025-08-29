import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MarketPricesModule } from './market-prices/market-prices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'waste_manager',
      autoLoadEntities: true,
      synchronize: false, // Deshabilitado - usamos migraciones SQL manuales
    }),
    MarketPricesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
