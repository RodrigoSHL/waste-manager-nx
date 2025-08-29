# Market Prices Module

Módulo completo para gestionar precios de mercado de residuos entre dispositores y tipos de residuos.

## 🏗️ Arquitectura

Este módulo implementa un sistema de precios históricos con las siguientes características:

- **Dispositores**: Empresas que procesan residuos
- **Residuos**: Tipos de materiales a procesar
- **Relación Many-to-Many**: Un dispositor puede procesar múltiples residuos, y un residuo puede ser procesado por múltiples dispositores
- **Historial de Precios**: Precios con períodos de validez usando rangos temporales de PostgreSQL
- **Prevención de Overlaps**: Constraint de exclusión para evitar períodos superpuestos

## 📁 Estructura de Archivos

```
apps/waste-api/src/app/market-prices/
├── market-prices.module.ts          # Módulo principal NestJS
├── entities/                        # Entidades TypeORM
│   ├── disposer.entity.ts
│   ├── disposer-contact.entity.ts
│   ├── waste.entity.ts
│   ├── uom.entity.ts
│   ├── currency.entity.ts
│   ├── disposer-waste.entity.ts
│   └── price-history.entity.ts
├── repositories/
│   └── market-prices.repository.ts  # Repositorio con consultas especializadas
├── services/
│   └── market-prices.service.ts     # Lógica de negocio
└── seed/
    └── seed-market-prices.ts        # Datos de ejemplo

migrations/
└── 1700000000000-init-market-prices.sql  # Migración inicial
```

## 🚀 Instalación y Configuración

### 1. Instalar dependencias

El proyecto ya incluye las dependencias necesarias:
- `@nestjs/typeorm`
- `typeorm`
- `pg` (PostgreSQL driver)

### 2. Ejecutar la migración

```bash
# Desde la raíz del monorepo Nx
cd /Users/rodrigocatalan/Development/projects/RodrigoSHL/waste-manager

# Conectarse a PostgreSQL y ejecutar la migración
psql -U postgres -d waste_manager -f migrations/1700000000000-init-market-prices.sql
```

### 3. Agregar el módulo al AppModule

```typescript
// apps/waste-api/src/app/app.module.ts
import { MarketPricesModule } from './market-prices/market-prices.module';

@Module({
  imports: [
    // ... otros imports
    MarketPricesModule,
  ],
  // ...
})
export class AppModule {}
```

### 4. Ejecutar seeds (datos de ejemplo)

```typescript
// Crear un script de seed o usar en un endpoint temporal
import { SeedMarketPrices } from './app/market-prices/seed/seed-market-prices';

// En tu aplicación:
const seedService = app.get(SeedMarketPrices);
await seedService.run();
```

## 📊 Modelo de Datos

### Entidades Principales

1. **Disposer** - Dispositores de residuos
   - `legal_name`, `trade_name`, `rut`, `website`
   - Relación 1:N con `DisposerContact`
   - Relación 1:N con `DisposerWaste`

2. **Waste** - Tipos de residuos
   - `code`, `name`, `description`, `hazard_class`
   - Relación 1:N con `DisposerWaste`

3. **DisposerWaste** - Relación M:N entre dispositores y residuos
   - Referencias a `Disposer`, `Waste`, `Uom`, `Currency`
   - `min_lot`, `lead_time_days`, `notes`, `is_active`
   - Constraint único: `(disposer_id, waste_id)`

4. **PriceHistory** - Historial de precios
   - `price`, `price_period` (tstzrange), `source`, `notes`
   - **Constraint de exclusión**: Previene períodos superpuestos

### Rangos Temporales

Los precios usan `tstzrange` de PostgreSQL:
- **Período abierto**: `[2024-01-01,)` (válido desde fecha hasta ahora)
- **Período cerrado**: `[2024-01-01,2024-06-01)` (válido entre fechas)
- **Consulta actual**: `WHERE price_period @> NOW()`

## 🔍 API de Consultas

### Métodos del Repository

```typescript
// Últimos precios de un dispositor
await repository.getLatestPricesByDisposer(disposerId);

// Serie histórica para gráficos
await repository.getTimeSeries(disposerId, wasteId);

// Comparación entre dispositores para un residuo
await repository.compareLatestForWaste(wasteId);

// Vista optimizada de todos los precios actuales
await repository.getLatestPricesView();
```

### Métodos del Service

```typescript
// Actualizar precio (cierra actual y crea nuevo)
await service.upsertNewPrice(disposerId, wasteId, newPrice, source, notes);

// Obtener estadísticas de precios por residuo
await service.getWastePriceStats(wasteId);

// Precio actual específico
await service.getCurrentPrice(disposerId, wasteId);
```

## 📈 Casos de Uso

### 1. Consultar precios actuales por dispositor

```typescript
const latestPrices = await marketPricesService.getLatestPricesByDisposer(1);
// Retorna todos los residuos con sus precios actuales para el dispositor
```

### 2. Actualizar precio

```typescript
await marketPricesService.upsertNewPrice(
  1,      // disposerId
  2,      // wasteId
  4500,   // newPrice
  'Cotización telefónica',
  'Precio especial por volumen'
);
// Cierra automáticamente el precio anterior y crea uno nuevo
```

### 3. Comparar precios entre dispositores

```typescript
const comparison = await marketPricesService.compareLatestForWaste(2);
// Retorna ranking de dispositores por precio para un residuo específico
```

### 4. Ver evolución histórica

```typescript
const timeSeries = await marketPricesService.getTimeSeries(1, 2);
// Útil para gráficos de evolución de precios
```

## 🔒 Constraints y Validaciones

### Base de Datos

- **Unicidad**: Un dispositor solo puede tener una relación activa por residuo
- **Exclusión temporal**: No pueden existir períodos de precio superpuestos
- **Precios positivos**: `CHECK (price > 0)`
- **Integridad referencial**: Cascadas en eliminaciones

### Aplicación

- Validación de precios > 0
- Verificación de relaciones activas antes de crear precios
- Manejo de excepciones con mensajes descriptivos

## 🚀 Performance

### Índices Creados

- `idx_disposer_wastes_disposer_id` - Consultas por dispositor
- `idx_price_history_gist` - Búsquedas por rangos temporales
- `idx_price_history_created_at` - Ordenamiento cronológico
- Vista materializada `v_latest_prices` - Consultas frecuentes optimizadas

### Vista Materializada

La vista `v_latest_prices` se actualiza automáticamente vía triggers cuando:
- Se insertan/actualizan/eliminan precios
- Se modifican relaciones dispositor-residuo

## 🧪 Datos de Ejemplo (Seeds)

Los seeds incluyen:

**Dispositores**:
- Bravo Energy SpA
- RBF Recycling Ltda  
- EcoWaste Solutions SA

**Residuos**:
- Plástico PET
- Baterías de Plomo
- Chatarra de Cobre
- Papel y Cartón
- Aceite Usado

**Historial de Precios**:
- 6 meses de datos históricos
- Precios actuales y variaciones
- Diferentes monedas y unidades

## 🔧 Comandos Útiles

```bash
# Ejecutar la aplicación
nx serve waste-api

# Conectar a la base de datos
psql -U postgres -d waste_manager

# Refrescar vista materializada manualmente
SELECT refresh_latest_prices_view();

# Ver precios actuales
SELECT * FROM v_latest_prices ORDER BY waste_name, disposer_legal_name;

# Verificar rangos de precios
SELECT disposer_waste_id, price, price_period 
FROM price_history 
WHERE price_period @> NOW();
```

## 🔄 Mantenimiento

### Actualización de Vista Materializada

La vista se actualiza automáticamente, pero en caso de problemas:

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY v_latest_prices;
```

### Limpieza de Datos Históricos

Para purgar precios antiguos (opcional):

```sql
DELETE FROM price_history 
WHERE created_at < NOW() - INTERVAL '2 years'
  AND NOT (price_period @> NOW());
```

## 🐛 Troubleshooting

### Error: "overlapping periods"

Si aparece este error, significa que se está intentando crear un precio con un período que se superpone con uno existente.

**Solución**: Usar el método `upsertNewPrice()` que automáticamente cierra el período anterior.

### Error: "relation not found"

Verificar que la relación dispositor-residuo existe y está activa:

```sql
SELECT * FROM disposer_wastes 
WHERE disposer_id = X AND waste_id = Y AND is_active = true;
```

### Performance lenta en consultas

Verificar que los índices existen:

```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'price_history';
```

---

## 📝 Notas Técnicas

- **Rangos abiertos**: Los precios actuales tienen `valid_to = NULL` representado como `[fecha,)` en PostgreSQL
- **Constraint de exclusión**: Usa GIST index para prevenir overlaps temporales
- **Vista materializada**: Optimiza consultas frecuentes de precios actuales
- **Triggers**: Mantienen la vista actualizada automáticamente

Este módulo está listo para producción y sigue las mejores prácticas de NestJS, TypeORM y PostgreSQL.
