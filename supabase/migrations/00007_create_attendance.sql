-- EstateFlow CRM: Migration 00007
-- Create attendance table

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  check_in_latitude DOUBLE PRECISION,
  check_in_longitude DOUBLE PRECISION,
  check_out_latitude DOUBLE PRECISION,
  check_out_longitude DOUBLE PRECISION,
  check_in_selfie_url TEXT,
  status attendance_status NOT NULL DEFAULT 'present',
  notes TEXT,
  field_visit_notes TEXT,
  total_hours DECIMAL(4,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_attendance_organization ON attendance(organization_id, date DESC);
CREATE INDEX idx_attendance_user ON attendance(user_id, date DESC);
CREATE INDEX idx_attendance_date ON attendance(organization_id, date);

CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
