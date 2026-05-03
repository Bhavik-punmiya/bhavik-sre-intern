CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE work_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id VARCHAR(100) NOT NULL,
  component_type VARCHAR(50) NOT NULL,
  severity VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  mttr_minutes INTEGER,
  signal_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rca_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_item_id UUID UNIQUE REFERENCES work_items(id),
  root_cause_category VARCHAR(100) NOT NULL,
  fix_applied TEXT NOT NULL,
  prevention_steps TEXT NOT NULL,
  incident_start TIMESTAMPTZ NOT NULL,
  incident_end TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_work_items_status ON work_items(status);
CREATE INDEX idx_work_items_severity ON work_items(severity);
CREATE INDEX idx_work_items_component ON work_items(component_id);

CREATE TABLE alert_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_type VARCHAR(50) UNIQUE NOT NULL,
  severity VARCHAR(10) NOT NULL,
  email VARCHAR(255) NOT NULL,
  webhook_url VARCHAR(500),
  enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default routing config
INSERT INTO alert_configs (component_type, severity, email, enabled) VALUES
('RDBMS', 'P0', 'oncall@ims.local', true),
('API',   'P1', 'backend@ims.local', true),
('QUEUE', 'P1', 'devops@ims.local', true),
('CACHE', 'P2', 'infra@ims.local', true),
('MCP',   'P2', 'infra@ims.local', true),
('NOSQL', 'P1', 'backend@ims.local', true)
ON CONFLICT (component_type) DO NOTHING;

