-- EstateFlow CRM: Migration 00006
-- Create followups table

CREATE TABLE followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type followup_type NOT NULL DEFAULT 'call',
  status followup_status NOT NULL DEFAULT 'pending',
  title TEXT NOT NULL,
  notes TEXT,
  template_name TEXT,
  message_body TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_followups_lead ON followups(lead_id);
CREATE INDEX idx_followups_assigned ON followups(assigned_to, status, scheduled_at);
CREATE INDEX idx_followups_organization ON followups(organization_id, status, scheduled_at);
CREATE INDEX idx_followups_due ON followups(organization_id, status, scheduled_at)
  WHERE status = 'pending';

CREATE TRIGGER update_followups_updated_at
  BEFORE UPDATE ON followups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
