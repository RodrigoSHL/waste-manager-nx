-- Migration: Init Market Prices
-- Created: 2024-11-28
-- Description: Creates all tables and structures for the market prices feature

-- Habilitar extensión para rangos de tiempo y GIST
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Tabla de unidades de medida
CREATE TABLE IF NOT EXISTS uoms (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    description VARCHAR(255) NOT NULL
);

-- Tabla de monedas
CREATE TABLE IF NOT EXISTS currencies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(5) UNIQUE NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    decimals INTEGER DEFAULT 2 NOT NULL
);

-- Tabla de dispositores
CREATE TABLE IF NOT EXISTS disposers (
    id SERIAL PRIMARY KEY,
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    rut VARCHAR(12) UNIQUE NOT NULL,
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabla de contactos de dispositores
CREATE TABLE IF NOT EXISTS disposer_contacts (
    id SERIAL PRIMARY KEY,
    disposer_id INTEGER NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(100),
    is_primary BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_disposer_contacts_disposer 
        FOREIGN KEY (disposer_id) 
        REFERENCES disposers(id) 
        ON DELETE CASCADE
);

-- Tabla de residuos
CREATE TABLE IF NOT EXISTS wastes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    hazard_class VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabla de relaciones dispositores-residuos (many-to-many)
CREATE TABLE IF NOT EXISTS disposer_wastes (
    id SERIAL PRIMARY KEY,
    disposer_id INTEGER NOT NULL,
    waste_id INTEGER NOT NULL,
    uom_id INTEGER NOT NULL,
    currency_id INTEGER NOT NULL,
    min_lot DECIMAL(10, 2),
    lead_time_days INTEGER,
    notes TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_disposer_wastes_disposer 
        FOREIGN KEY (disposer_id) 
        REFERENCES disposers(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_disposer_wastes_waste 
        FOREIGN KEY (waste_id) 
        REFERENCES wastes(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_disposer_wastes_uom 
        FOREIGN KEY (uom_id) 
        REFERENCES uoms(id),
    CONSTRAINT fk_disposer_wastes_currency 
        FOREIGN KEY (currency_id) 
        REFERENCES currencies(id),
    CONSTRAINT uk_disposer_wastes_unique 
        UNIQUE (disposer_id, waste_id)
);

-- Tabla de historial de precios
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    disposer_waste_id INTEGER NOT NULL,
    price DECIMAL(15, 4) NOT NULL,
    price_period TSTZRANGE NOT NULL,
    source VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_price_history_disposer_waste 
        FOREIGN KEY (disposer_waste_id) 
        REFERENCES disposer_wastes(id) 
        ON DELETE CASCADE,
    CONSTRAINT ck_price_positive 
        CHECK (price > 0)
);

-- Constraint de exclusión para prevenir períodos superpuestos
ALTER TABLE price_history 
ADD CONSTRAINT exclude_overlapping_periods 
EXCLUDE USING gist (disposer_waste_id WITH =, price_period WITH &&);

-- Índices para optimizar consultas

-- Índices para disposer_wastes
CREATE INDEX IF NOT EXISTS idx_disposer_wastes_disposer_id ON disposer_wastes(disposer_id);
CREATE INDEX IF NOT EXISTS idx_disposer_wastes_waste_id ON disposer_wastes(waste_id);
CREATE INDEX IF NOT EXISTS idx_disposer_wastes_active ON disposer_wastes(is_active) WHERE is_active = true;

-- Índices para price_history
CREATE INDEX IF NOT EXISTS idx_price_history_disposer_waste_id ON price_history(disposer_waste_id);
CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON price_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_gist ON price_history USING gist(disposer_waste_id, price_period);

-- Índices para disposer_contacts
CREATE INDEX IF NOT EXISTS idx_disposer_contacts_disposer_id ON disposer_contacts(disposer_id);
CREATE INDEX IF NOT EXISTS idx_disposer_contacts_primary ON disposer_contacts(disposer_id, is_primary) WHERE is_primary = true;

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_disposers_active ON disposers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_disposers_rut ON disposers(rut);
CREATE INDEX IF NOT EXISTS idx_wastes_code ON wastes(code);
CREATE INDEX IF NOT EXISTS idx_wastes_name ON wastes(name);

-- Vista materializada para últimos precios (opcional, para mejor performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS v_latest_prices AS
SELECT 
    ph.id as price_id,
    ph.price,
    ph.price_period,
    ph.source,
    ph.created_at as price_created_at,
    dw.id as disposer_waste_id,
    dw.min_lot,
    dw.lead_time_days,
    dw.notes as disposer_notes,
    d.id as disposer_id,
    d.legal_name as disposer_legal_name,
    d.trade_name as disposer_trade_name,
    d.rut as disposer_rut,
    w.id as waste_id,
    w.code as waste_code,
    w.name as waste_name,
    w.description as waste_description,
    w.hazard_class,
    u.code as uom_code,
    u.description as uom_description,
    c.code as currency_code,
    c.symbol as currency_symbol,
    c.decimals as currency_decimals
FROM price_history ph
INNER JOIN disposer_wastes dw ON ph.disposer_waste_id = dw.id
INNER JOIN disposers d ON dw.disposer_id = d.id
INNER JOIN wastes w ON dw.waste_id = w.id
INNER JOIN uoms u ON dw.uom_id = u.id
INNER JOIN currencies c ON dw.currency_id = c.id
WHERE dw.is_active = true 
  AND d.is_active = true
  AND ph.price_period @> NOW()
ORDER BY w.name, d.legal_name;

-- Índice único en la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_v_latest_prices_unique 
ON v_latest_prices(disposer_id, waste_id);

-- Función para refrescar la vista materializada
CREATE OR REPLACE FUNCTION refresh_latest_prices_view()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY v_latest_prices;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente la vista cuando cambian los precios
CREATE OR REPLACE FUNCTION trigger_refresh_latest_prices()
RETURNS TRIGGER AS $$
BEGIN
    -- Refrescar la vista en diferido para no bloquear la transacción
    PERFORM pg_notify('refresh_prices_view', '');
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger a las tablas relevantes
DROP TRIGGER IF EXISTS tr_price_history_refresh ON price_history;
CREATE TRIGGER tr_price_history_refresh
    AFTER INSERT OR UPDATE OR DELETE ON price_history
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_refresh_latest_prices();

DROP TRIGGER IF EXISTS tr_disposer_wastes_refresh ON disposer_wastes;
CREATE TRIGGER tr_disposer_wastes_refresh
    AFTER UPDATE ON disposer_wastes
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_refresh_latest_prices();

-- Comentarios para documentación
COMMENT ON TABLE disposers IS 'Empresas que procesan y reciben residuos';
COMMENT ON TABLE disposer_contacts IS 'Contactos de las empresas dispositoras';
COMMENT ON TABLE wastes IS 'Tipos de residuos que pueden ser procesados';
COMMENT ON TABLE uoms IS 'Unidades de medida para los residuos';
COMMENT ON TABLE currencies IS 'Monedas para expresar precios';
COMMENT ON TABLE disposer_wastes IS 'Relación many-to-many entre dispositores y residuos';
COMMENT ON TABLE price_history IS 'Historial de precios con períodos de validez';

COMMENT ON COLUMN price_history.price_period IS 'Período de validez del precio usando rangos temporales (tstzrange)';
COMMENT ON CONSTRAINT exclude_overlapping_periods ON price_history IS 'Previene períodos de precios superpuestos para la misma combinación dispositor-residuo';

-- Insertar datos básicos de referencia
INSERT INTO uoms (code, description) VALUES
('kg', 'Kilogramo'),
('ton', 'Tonelada'),
('lt', 'Litro'),
('m3', 'Metro cúbico'),
('unit', 'Unidad')
ON CONFLICT (code) DO NOTHING;

INSERT INTO currencies (code, symbol, decimals) VALUES
('CLP', '$', 0),
('UF', 'UF', 2),
('USD', 'US$', 2)
ON CONFLICT (code) DO NOTHING;

-- Mensaje de finalización
DO $$
BEGIN
    RAISE NOTICE 'Migración de Market Prices completada exitosamente';
    RAISE NOTICE 'Tablas creadas: disposers, disposer_contacts, wastes, uoms, currencies, disposer_wastes, price_history';
    RAISE NOTICE 'Vista materializada creada: v_latest_prices';
    RAISE NOTICE 'Funciones y triggers creados para mantenimiento automático';
END
$$;
