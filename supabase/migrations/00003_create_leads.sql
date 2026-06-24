-- EstateFlow CRM: Migration 00003
-- Create leads table

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source lead_source NOT NULL DEFAULT 'manual',
  property_type property_type,
  budget_min BIGINT,
  budget_max BIGINT,
  preferred_location TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  temperature lead_temperature NOT NULL DEFAULT 'warm',
  assigned_agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  next_followup_at TIMESTAMPTZ,
  last_contacted_at TIMESTAMPTZ,
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  lost_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_organization ON leads(organization_id);
CREATE INDEX idx_leads_status ON leads(organization_id, status);
CREATE INDEX idx_leads_agent ON leads(assigned_agent_id);
CREATE INDEX idx_leads_temperature ON leads(organization_id, temperature);
CREATE INDEX idx_leads_source ON leads(organization_id, source);
CREATE INDEX idx_leads_followup ON leads(organization_id, next_followup_at);
CREATE INDEX idx_leads_created ON leads(organization_id, created_at DESC);
CREATE INDEX idx_leads_phone ON leads(organization_id, phone);

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
