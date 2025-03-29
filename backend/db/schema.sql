-- Creación de extensiones útiles (por ejemplo, para UUID si se necesita en el futuro)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Roles (para normalización y flexibilidad en los roles de usuarios)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(15) UNIQUE NOT NULL  -- Ejemplo de contenido: 'administrador', 'funcionário'
);

-- Tabla de Usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,           -- Ejemplo: 'João Silva'
    email VARCHAR(255) UNIQUE NOT NULL,   -- Ejemplo: 'joao.silva@email.com'
    password VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas frecuentes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

-- Tabla de Categorías (normalización para evitar redundancia en productos)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL     -- Ejemplo: 'Eletrônicos', 'Roupas'
);

-- Tabla de Productos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,           -- Ejemplo: 'Celular Samsung'
    category_id INTEGER NOT NULL REFERENCES categories(id),
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),  -- Ejemplo: 1500.99
    stock INTEGER NOT NULL CHECK (stock >= 0),        -- Ejemplo: 50
    alert_threshold INTEGER NOT NULL CHECK (alert_threshold >= 0), -- Ejemplo: 10
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_name_category UNIQUE (name, category_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_stock ON products(stock);

-- Tabla de Movimientos
CREATE TABLE movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    type VARCHAR(8) CHECK (type IN ('entrada', 'saida')) NOT NULL, -- Ejemplo: 'entrada'
    quantity INTEGER NOT NULL CHECK (quantity > 0),   -- Ejemplo: 20
    notes TEXT,                                       -- Ejemplo: 'Recebido do fornecedor'
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas frecuentes
CREATE INDEX idx_movements_movement_date ON movements(movement_date);
CREATE INDEX idx_movements_product_id ON movements(product_id);
CREATE INDEX idx_movements_type ON movements(type);

-- Tabla de Configuraciones
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,       -- Ejemplo: 'Minha Empresa LTDA'
    company_email VARCHAR(255) NOT NULL,      -- Ejemplo: 'contato@minhaempresa.com'
    company_phone VARCHAR(20),                -- Ejemplo: '+55 11 99999-9999'
    company_address TEXT,                     -- Ejemplo: 'Rua das Flores, 123, São Paulo'
    stock_alert_notification BOOLEAN DEFAULT true,
    daily_reports_notification BOOLEAN DEFAULT false,
    email_notification BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Fechamentos de Caixa
CREATE TABLE cash_closures (
    id SERIAL PRIMARY KEY,
    closure_date TIMESTAMP NOT NULL,          -- Ejemplo: '2023-10-15 18:00:00'
    notes TEXT,                               -- Ejemplo: 'Fechamento normal'
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    total_movements INTEGER NOT NULL,         -- Ejemplo: 25
    entries NUMERIC(12,2) NOT NULL,           -- Ejemplo: 5000.00
    exits NUMERIC(12,2) NOT NULL,             -- Ejemplo: 2000.00
    total_value NUMERIC(12,2) NOT NULL,       -- Ejemplo: 3000.00
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para consultas por fecha
CREATE INDEX idx_cash_closures_closure_date ON cash_closures(closure_date);

-- Trigger para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_users
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_products
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_settings
    BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();