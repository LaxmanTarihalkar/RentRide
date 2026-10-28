-- Partners table for approved car owners with login credentials
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    partner_id VARCHAR(50) UNIQUE NOT NULL, -- Unique partner identifier like FC123456
    owner_id INTEGER REFERENCES owners(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashed password
    temp_password BOOLEAN DEFAULT TRUE, -- Flag to force password change on first login
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'inactive'
    last_login TIMESTAMP,
    password_changed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partners_partner_id ON partners(partner_id);
CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);
CREATE INDEX IF NOT EXISTS idx_partners_owner_id ON partners(owner_id);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);

-- Add partner_id to owners table to link with partners
ALTER TABLE owners ADD COLUMN IF NOT EXISTS partner_id VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_owners_partner_id ON owners(partner_id);