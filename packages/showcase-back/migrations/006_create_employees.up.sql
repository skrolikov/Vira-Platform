CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    password_hash VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(255) NOT NULL,
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    specializations TEXT[],
    certifications TEXT[],
    schedule JSONB,
    performance JSONB,
    telegram_chat_id VARCHAR(100),
    location_id UUID REFERENCES company_locations(id) ON DELETE SET NULL,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF EXISTS idx_employees_location_id ON employees(location_id);

