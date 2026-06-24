-- EstateFlow CRM: Migration 00005
-- Create activities, calls, messages, lead_property_shares tables

-- Activities / Timeline
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  type activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activities_lead ON activities(lead_id, created_at DESC);
CREATE INDEX idx_activities_user ON activities(user_id, created_at DESC);
CREATE INDEX idx_activities_organization ON activities(organization_id, created_at DESC);
CREATE INDEX idx_activities_type ON activities(organization_id, type);

-- Call logs
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  call_sid TEXT,
  conference_sid TEXT,
  status TEXT NOT NULL DEFAULT 'initiated',
  duration INTEGER DEFAULT 0,
  recording_url TEXT,
  outcome call_outcome DEFAULT 'pending',
  notes TEXT,
  is_bridge_call BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_calls_lead ON calls(lead_id, created_at DESC);
CREATE INDEX idx_calls_agent ON calls(agent_id, created_at DESC);
CREATE INDEX idx_calls_organization ON calls(organization_id, created_at DESC);
CREATE INDEX idx_calls_sid ON calls(call_sid);

CREATE TRIGGER update_calls_updated_at
  BEFORE UPDATE ON calls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Messages (WhatsApp, SMS, Email)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  channel message_channel NOT NULL,
  direction TEXT NOT NULL DEFAULT 'outbound', -- 'inbound' or 'outbound'
  to_number TEXT,
  from_number TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  template_name TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  external_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_lead ON messages(lead_id, created_at DESC);
CREATE INDEX idx_messages_organization ON messages(organization_id, created_at DESC);

-- Lead-Property Shares
CREATE TABLE lead_property_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  channel message_channel,
  share_link TEXT,
  message_body TEXT,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_property_shares_lead ON lead_property_shares(lead_id);
CREATE INDEX idx_lead_property_shares_property ON lead_property_shares(property_id);
