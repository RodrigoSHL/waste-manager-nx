-- Migration: Complete Waste Management Schema with Hierarchy
-- Created: 2024-09-10
-- Description: Creates complete database schema for waste management with hierarchical waste classification

-- ============================================================================
-- EXTENSION AND TYPES
-- ============================================================================

-- Enable UUID extension if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- BASE TABLES
-- ============================================================================

-- 1. UNIDADES DE MEDIDA (UOM)
CREATE TABLE IF NOT EXISTS uoms (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    description VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. MONEDAS
CREATE TABLE IF NOT EXISTS currencies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(5) NOT NULL,
    decimals INTEGER DEFAULT 2 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- WASTE HIERARCHY TABLES
-- ============================================================================

-- 3. TIPOS DE RESIDUOS (nivel 1 - más general)
CREATE TABLE IF NOT EXISTS waste_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Color hex para UI (#FF5733)
    icon VARCHAR(50), -- Nombre del icono para UI
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. CATEGORÍAS DE RESIDUOS (nivel 2 - específico del tipo)
CREATE TABLE IF NOT EXISTS waste_categories (
    id SERIAL PRIMARY KEY,
    waste_type_id INTEGER NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    technical_specs JSONB, -- Especificaciones técnicas como densidad, punto de fusión, etc.
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_waste_categories_type 
        FOREIGN KEY (waste_type_id) 
        REFERENCES waste_types(id) 
        ON DELETE RESTRICT
);

-- 5. RESIDUOS (nivel 3 - productos específicos)
CREATE TABLE IF NOT EXISTS wastes (
    id SERIAL PRIMARY KEY,
    waste_category_id INTEGER,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    subproduct_name VARCHAR(200), -- Nombre específico del subproducto
    description TEXT,
    hazard_class VARCHAR(10), -- Clase de peligrosidad
    specifications JSONB, -- Especificaciones particulares del residuo
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_wastes_category 
        FOREIGN KEY (waste_category_id) 
        REFERENCES waste_categories(id) 
        ON DELETE RESTRICT
);

-- ============================================================================
-- DISPOSER TABLES
-- ============================================================================

-- 6. DISPOSITORES
CREATE TABLE IF NOT EXISTS disposers (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    business_type VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    postal_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    certifications TEXT[],
    operating_since DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. CONTACTOS DE DISPOSITORES
CREATE TABLE IF NOT EXISTS disposer_contacts (
    id SERIAL PRIMARY KEY,
    disposer_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    department VARCHAR(100),
    is_primary BOOLEAN DEFAULT false NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_disposer_contacts_disposer 
        FOREIGN KEY (disposer_id) 
        REFERENCES disposers(id) 
        ON DELETE CASCADE
);

-- ============================================================================
-- RELATIONSHIP AND PRICING TABLES
-- ============================================================================

-- 8. RELACIONES DISPOSITORES-RESIDUOS
CREATE TABLE IF NOT EXISTS disposer_wastes (
    id SERIAL PRIMARY KEY,
    disposer_id INTEGER NOT NULL,
    waste_id INTEGER NOT NULL,
    uom_id INTEGER NOT NULL,
    currency_id INTEGER NOT NULL,
    min_lot DECIMAL(10,2),
    max_capacity DECIMAL(10,2),
    lead_time_days INTEGER,
    pickup_available BOOLEAN DEFAULT false,
    transportation_included BOOLEAN DEFAULT false,
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
        ON DELETE RESTRICT,
    CONSTRAINT fk_disposer_wastes_uom 
        FOREIGN KEY (uom_id) 
        REFERENCES uoms(id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_disposer_wastes_currency 
        FOREIGN KEY (currency_id) 
        REFERENCES currencies(id) 
        ON DELETE RESTRICT,
    CONSTRAINT uk_disposer_wastes_unique 
        UNIQUE (disposer_id, waste_id)
);

-- 9. HISTORIAL DE PRECIOS
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    disposer_waste_id INTEGER NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    price_period TSTZRANGE NOT NULL,
    source VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_price_history_disposer_waste 
        FOREIGN KEY (disposer_waste_id) 
        REFERENCES disposer_wastes(id) 
        ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indices para waste_types
CREATE INDEX IF NOT EXISTS idx_waste_types_active ON waste_types(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_waste_types_code ON waste_types(code);

-- Indices para waste_categories
CREATE INDEX IF NOT EXISTS idx_waste_categories_type_id ON waste_categories(waste_type_id);
CREATE INDEX IF NOT EXISTS idx_waste_categories_active ON waste_categories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_waste_categories_code ON waste_categories(code);

-- Indices para wastes
CREATE INDEX IF NOT EXISTS idx_wastes_category_id ON wastes(waste_category_id);
CREATE INDEX IF NOT EXISTS idx_wastes_active ON wastes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_wastes_code ON wastes(code);

-- Indices para disposers
CREATE INDEX IF NOT EXISTS idx_disposers_rut ON disposers(rut);
CREATE INDEX IF NOT EXISTS idx_disposers_active ON disposers(is_active) WHERE is_active = true;

-- Indices para disposer_wastes
CREATE INDEX IF NOT EXISTS idx_disposer_wastes_disposer_id ON disposer_wastes(disposer_id);
CREATE INDEX IF NOT EXISTS idx_disposer_wastes_waste_id ON disposer_wastes(waste_id);
CREATE INDEX IF NOT EXISTS idx_disposer_wastes_active ON disposer_wastes(is_active) WHERE is_active = true;

-- Indices para price_history
CREATE INDEX IF NOT EXISTS idx_price_history_disposer_waste_id ON price_history(disposer_waste_id);
CREATE INDEX IF NOT EXISTS idx_price_history_period ON price_history USING gist(price_period);

-- Índice compuesto para búsquedas jerárquicas
CREATE INDEX IF NOT EXISTS idx_waste_hierarchy_search 
ON wastes USING gin(to_tsvector('spanish', COALESCE(name, '') || ' ' || COALESCE(subproduct_name, '')));

-- ============================================================================
-- CONSTRAINTS AND UNIQUE INDEXES
-- ============================================================================

-- Constraint único compuesto para evitar duplicados en wastes
ALTER TABLE wastes 
ADD CONSTRAINT uk_wastes_category_subproduct 
    UNIQUE (waste_category_id, subproduct_name);

-- Constraint para asegurar que solo hay un contacto primario por disposer
CREATE UNIQUE INDEX uk_disposer_contacts_primary 
ON disposer_contacts(disposer_id) 
WHERE is_primary = true AND is_active = true;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS tr_waste_types_updated_at ON waste_types;
CREATE TRIGGER tr_waste_types_updated_at
    BEFORE UPDATE ON waste_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_waste_categories_updated_at ON waste_categories;
CREATE TRIGGER tr_waste_categories_updated_at
    BEFORE UPDATE ON waste_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_wastes_updated_at ON wastes;
CREATE TRIGGER tr_wastes_updated_at
    BEFORE UPDATE ON wastes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_disposers_updated_at ON disposers;
CREATE TRIGGER tr_disposers_updated_at
    BEFORE UPDATE ON disposers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_disposer_wastes_updated_at ON disposer_wastes;
CREATE TRIGGER tr_disposer_wastes_updated_at
    BEFORE UPDATE ON disposer_wastes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS AND HELPER FUNCTIONS
-- ============================================================================

-- Vista optimizada para consultas jerárquicas
CREATE OR REPLACE VIEW v_waste_hierarchy AS
SELECT 
    w.id as waste_id,
    w.code as waste_code,
    w.name as waste_name,
    w.subproduct_name,
    w.description as waste_description,
    w.hazard_class,
    w.specifications as waste_specs,
    w.is_active as waste_active,
    
    wc.id as category_id,
    wc.code as category_code,
    wc.name as category_name,
    wc.description as category_description,
    wc.technical_specs as category_specs,
    wc.is_active as category_active,
    
    wt.id as type_id,
    wt.code as type_code,
    wt.name as type_name,
    wt.description as type_description,
    wt.color as type_color,
    wt.icon as type_icon,
    wt.is_active as type_active,
    
    -- Campo combinado para búsqueda
    CONCAT(wt.name, ' > ', wc.name, ' > ', COALESCE(w.subproduct_name, w.name)) as full_hierarchy,
    
    w.created_at,
    w.updated_at
FROM wastes w
LEFT JOIN waste_categories wc ON w.waste_category_id = wc.id
LEFT JOIN waste_types wt ON wc.waste_type_id = wt.id
WHERE w.is_active = true;

-- Función para obtener jerarquía completa
CREATE OR REPLACE FUNCTION get_waste_full_name(waste_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    SELECT CONCAT(wt.name, ' > ', wc.name, ' > ', COALESCE(w.subproduct_name, w.name))
    INTO result
    FROM wastes w
    LEFT JOIN waste_categories wc ON w.waste_category_id = wc.id
    LEFT JOIN waste_types wt ON wc.waste_type_id = wt.id
    WHERE w.id = waste_id;
    
    RETURN COALESCE(result, 'Residuo sin categorizar');
END;
$$ LANGUAGE plpgsql;

-- Vista materializada para precios actuales
CREATE MATERIALIZED VIEW v_latest_prices AS
SELECT 
    ph.id as price_id,
    ph.price,
    ph.price_period,
    ph.source,
    ph.created_at as price_created_at,
    dw.id as disposer_waste_id,
    dw.min_lot,
    dw.max_capacity,
    dw.lead_time_days,
    dw.pickup_available,
    dw.transportation_included,
    dw.notes as disposer_notes,
    d.id as disposer_id,
    d.legal_name as disposer_legal_name,
    d.trade_name as disposer_trade_name,
    d.rut as disposer_rut,
    d.city as disposer_city,
    d.region as disposer_region,
    w.id as waste_id,
    w.code as waste_code,
    w.name as waste_name,
    w.subproduct_name,
    w.description as waste_description,
    w.hazard_class,
    -- Información de jerarquía
    wc.id as category_id,
    wc.code as category_code,
    wc.name as category_name,
    wt.id as type_id,
    wt.code as type_code,
    wt.name as type_name,
    wt.color as type_color,
    wt.icon as type_icon,
    -- Nombre completo jerárquico
    CONCAT(wt.name, ' > ', wc.name, ' > ', COALESCE(w.subproduct_name, w.name)) as waste_full_name,
    u.code as uom_code,
    u.description as uom_description,
    u.symbol as uom_symbol,
    c.code as currency_code,
    c.symbol as currency_symbol,
    c.decimals as currency_decimals
FROM price_history ph
INNER JOIN disposer_wastes dw ON ph.disposer_waste_id = dw.id
INNER JOIN disposers d ON dw.disposer_id = d.id
INNER JOIN wastes w ON dw.waste_id = w.id
LEFT JOIN waste_categories wc ON w.waste_category_id = wc.id
LEFT JOIN waste_types wt ON wc.waste_type_id = wt.id
INNER JOIN uoms u ON dw.uom_id = u.id
INNER JOIN currencies c ON dw.currency_id = c.id
WHERE dw.is_active = true 
  AND d.is_active = true
  AND w.is_active = true
  AND ph.price_period @> NOW()
ORDER BY wt.name, wc.name, COALESCE(w.subproduct_name, w.name), d.legal_name;

-- Recrear índice único para la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_v_latest_prices_unique 
ON v_latest_prices(disposer_id, waste_id);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- UNIDADES DE MEDIDA
INSERT INTO uoms (code, description, symbol) VALUES
('kg', 'Kilogramo', 'kg'),
('ton', 'Tonelada', 't'),
('lt', 'Litro', 'L'),
('m3', 'Metro Cúbico', 'm³'),
('unit', 'Unidad', 'ud')
ON CONFLICT (code) DO NOTHING;

-- MONEDAS
INSERT INTO currencies (code, name, symbol, decimals) VALUES
('CLP', 'Peso Chileno', '$', 0),
('USD', 'Dólar Estadounidense', 'US$', 2),
('EUR', 'Euro', '€', 2)
ON CONFLICT (code) DO NOTHING;

-- TIPOS DE RESIDUOS
INSERT INTO waste_types (code, name, description, color, icon) VALUES
('PLASTIC', 'Plástico', 'Residuos de materiales plásticos y polímeros', '#2E8B57', 'recycle'),
('METAL', 'Metal', 'Residuos metálicos ferrosos y no ferrosos', '#708090', 'build'),
('GLASS', 'Vidrio', 'Residuos de vidrio y cristal', '#4682B4', 'wine_bar'),
('PAPER', 'Papel y Cartón', 'Residuos de papel, cartón y derivados', '#DEB887', 'description'),
('WOOD', 'Madera', 'Residuos de madera y productos derivados', '#8B4513', 'park'),
('ELECTRONIC', 'Electrónico', 'Residuos de aparatos eléctricos y electrónicos', '#483D8B', 'computer'),
('BATTERY', 'Baterías', 'Baterías y acumuladores', '#DC143C', 'battery_full'),
('OIL', 'Aceites', 'Aceites usados y lubricantes', '#2F4F4F', 'oil_barrel'),
('ORGANIC', 'Orgánico', 'Residuos orgánicos y biodegradables', '#228B22', 'eco'),
('TEXTILE', 'Textil', 'Residuos textiles y fibras', '#9370DB', 'checkroom'),
('CHEMICAL', 'Químico', 'Residuos químicos y peligrosos', '#FF4500', 'science'),
('RUBBER', 'Caucho', 'Residuos de caucho y neumáticos', '#2F2F2F', 'tire_repair')
ON CONFLICT (code) DO NOTHING;

-- CATEGORÍAS DE RESIDUOS
INSERT INTO waste_categories (waste_type_id, code, name, description, technical_specs) VALUES
-- Plásticos
((SELECT id FROM waste_types WHERE code = 'PLASTIC'), 'PET', 'PET (Polietileno Tereftalato)', 'Utilizado en botellas de bebidas y envases alimentarios', '{"density": "1.38-1.41", "melting_point": "250-260", "recycling_code": "1"}'),
((SELECT id FROM waste_types WHERE code = 'PLASTIC'), 'HDPE', 'HDPE (Polietileno de Alta Densidad)', 'Botellas de leche, detergentes, juguetes', '{"density": "0.94-0.97", "melting_point": "120-130", "recycling_code": "2"}'),
((SELECT id FROM waste_types WHERE code = 'PLASTIC'), 'PVC', 'PVC (Policloruro de Vinilo)', 'Tuberías, marcos de ventana, juguetes', '{"density": "1.38-1.41", "melting_point": "100-260", "recycling_code": "3"}'),
((SELECT id FROM waste_types WHERE code = 'PLASTIC'), 'LDPE', 'LDPE (Polietileno de Baja Densidad)', 'Bolsas plásticas, film alimentario', '{"density": "0.91-0.94", "melting_point": "105-115", "recycling_code": "4"}'),
((SELECT id FROM waste_types WHERE code = 'PLASTIC'), 'PP', 'PP (Polipropileno)', 'Tapas de botellas, envases yogur', '{"density": "0.90-0.91", "melting_point": "160-166", "recycling_code": "5"}'),
((SELECT id FROM waste_types WHERE code = 'PLASTIC'), 'PS', 'PS (Poliestireno)', 'Envases desechables, bandejas', '{"density": "1.04-1.09", "melting_point": "240", "recycling_code": "6"}'),

-- Metales
((SELECT id FROM waste_types WHERE code = 'METAL'), 'COPPER', 'Cobre', 'Cables, tuberías, componentes electrónicos', '{"density": "8.96", "melting_point": "1085", "purity_grades": ["99.9", "99.5", "95.0"]}'),
((SELECT id FROM waste_types WHERE code = 'METAL'), 'ALUMINUM', 'Aluminio', 'Latas, perfiles, componentes automotrices', '{"density": "2.70", "melting_point": "660", "alloys": ["6061", "6063", "1100"]}'),
((SELECT id FROM waste_types WHERE code = 'METAL'), 'STEEL', 'Acero', 'Estructuras, electrodomésticos, automóviles', '{"density": "7.85", "melting_point": "1370-1510", "types": ["carbon", "stainless", "alloy"]}'),
((SELECT id FROM waste_types WHERE code = 'METAL'), 'IRON', 'Hierro', 'Chatarra ferrosa, piezas industriales', '{"density": "7.87", "melting_point": "1538", "magnetic": true}'),

-- Vidrio
((SELECT id FROM waste_types WHERE code = 'GLASS'), 'CLEAR_GLASS', 'Vidrio Transparente', 'Botellas y envases transparentes', '{"density": "2.5", "melting_point": "1700", "color": "clear"}'),
((SELECT id FROM waste_types WHERE code = 'GLASS'), 'BROWN_GLASS', 'Vidrio Ámbar', 'Botellas de cerveza y medicamentos', '{"density": "2.5", "melting_point": "1700", "color": "brown"}'),
((SELECT id FROM waste_types WHERE code = 'GLASS'), 'GREEN_GLASS', 'Vidrio Verde', 'Botellas de vino y conservas', '{"density": "2.5", "melting_point": "1700", "color": "green"}'),

-- Papel
((SELECT id FROM waste_types WHERE code = 'PAPER'), 'CARDBOARD', 'Cartón', 'Cajas de cartón corrugado y plegadizo', '{"gsm_range": "120-440", "recycled_content": "variable"}'),
((SELECT id FROM waste_types WHERE code = 'PAPER'), 'NEWSPAPER', 'Papel Periódico', 'Periódicos y papel prensa', '{"gsm_range": "40-48", "recycled_content": "high"}'),
((SELECT id FROM waste_types WHERE code = 'PAPER'), 'OFFICE_PAPER', 'Papel de Oficina', 'Papel blanco de impresión y escritura', '{"gsm_range": "70-90", "whiteness": "high"}'),

-- Baterías
((SELECT id FROM waste_types WHERE code = 'BATTERY'), 'LEAD_ACID', 'Baterías de Plomo-Ácido', 'Baterías automotrices e industriales', '{"voltage": "12V", "lead_content": "60-70%", "acid_content": "35%"}'),
((SELECT id FROM waste_types WHERE code = 'BATTERY'), 'LITHIUM_ION', 'Baterías de Litio-Ion', 'Baterías de dispositivos móviles y vehículos eléctricos', '{"voltage": "3.7V", "lithium_content": "variable", "cobalt_content": "variable"}'),
((SELECT id FROM waste_types WHERE code = 'BATTERY'), 'NICKEL_CADMIUM', 'Baterías de Níquel-Cadmio', 'Baterías recargables industriales', '{"voltage": "1.2V", "cadmium_content": "15-20%", "nickel_content": "variable"}')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE waste_types IS 'Tipos base de residuos (Plástico, Metal, Vidrio, etc.)';
COMMENT ON TABLE waste_categories IS 'Categorías específicas dentro de cada tipo (PET, Cobre, etc.)';
COMMENT ON TABLE wastes IS 'Productos específicos de residuos (Botella PET bebida, etc.)';

COMMENT ON COLUMN waste_types.color IS 'Color hexadecimal para representación visual en UI';
COMMENT ON COLUMN waste_types.icon IS 'Nombre del icono Material Design para UI';
COMMENT ON COLUMN waste_categories.technical_specs IS 'Especificaciones técnicas en formato JSON';
COMMENT ON COLUMN wastes.subproduct_name IS 'Nombre específico del subproducto (ej: "Botella de bebida")';
COMMENT ON COLUMN wastes.specifications IS 'Especificaciones particulares del residuo en formato JSON';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Refrescar vista materializada
REFRESH MATERIALIZED VIEW v_latest_prices;

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'Migración completa del modelo jerárquico exitosa!';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'Tablas creadas:';
    RAISE NOTICE '  ✓ uoms, currencies (datos base)';
    RAISE NOTICE '  ✓ waste_types, waste_categories, wastes (jerarquía)';
    RAISE NOTICE '  ✓ disposers, disposer_contacts (dispositores)';
    RAISE NOTICE '  ✓ disposer_wastes, price_history (relaciones)';
    RAISE NOTICE 'Vistas creadas:';
    RAISE NOTICE '  ✓ v_waste_hierarchy (consultas jerárquicas)';
    RAISE NOTICE '  ✓ v_latest_prices (precios actuales)';
    RAISE NOTICE 'Funciones:';
    RAISE NOTICE '  ✓ get_waste_full_name() (jerarquía completa)';
    RAISE NOTICE '  ✓ update_updated_at_column() (timestamps)';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'Base de datos lista para usar! 🚀';
    RAISE NOTICE '=======================================================';
END
$$;
