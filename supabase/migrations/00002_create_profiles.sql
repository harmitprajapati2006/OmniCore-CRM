-- EstateFlow CRM: Migration 00002
-- Create profiles table (extends Supabase auth.users)

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'sales_agent',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_available BOOLEAN NOT NULL DEFAULT true,
  last_lead_assigned_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_available ON profiles(organization_id, role, is_available, is_active);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
