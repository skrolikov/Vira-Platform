CREATE TABLE IF NOT EXISTS statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    color VARCHAR(50),
    description TEXT,
    active BOOLEAN DEFAULT true,
    parent_id UUID REFERENCES statuses(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_statuses_code ON statuses(code);
CREATE INDEX IF NOT EXISTS idx_statuses_type ON statuses(type);
CREATE INDEX IF NOT EXISTS idx_statuses_parent_id ON statuses(parent_id);

