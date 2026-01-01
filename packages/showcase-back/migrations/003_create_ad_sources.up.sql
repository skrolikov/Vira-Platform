CREATE TABLE IF NOT EXISTS ad_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ad_sources_is_active ON ad_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_ad_sources_sort_order ON ad_sources(sort_order);

