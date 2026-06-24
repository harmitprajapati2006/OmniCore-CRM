-- EstateFlow CRM: Migration 00001
-- Create enum types and organizations table

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'admin',
  'sales_manager',
  'sales_agent',
  'field_executive',
  'social_media_manager'
);

CREATE TYPE lead_status AS ENUM (
  'new',
  'contacted',
  'interested',
  'site_visit_scheduled',
  'negotiation',
  'won',
  'lost',
  'not_responding'
);

CREATE TYPE lead_temperature AS ENUM (
  'cold',
  'warm',
  'hot'
);

CREATE TYPE lead_source AS ENUM (
  '36_acre',
  'magicbricks',
  'housing',
  'facebook',
  'instagram',
  'website',
  'referral',
  'manual',
  'other'
);

CREATE TYPE property_type AS ENUM (
  'apartment',
  'villa',
  'plot',
  'commercial',
  'rental'
);

CREATE TYPE property_availability AS ENUM (
  'available',
  'hold',
  'sold',
  'rented'
);

CREATE TYPE furnishing_status AS ENUM (
  'unfurnished',
  'semi_furnished',
  'fully_furnished'
);

CREATE TYPE message_channel AS ENUM (
  'whatsapp',
  'sms',
  'email'
);

CREATE TYPE followup_type AS ENUM (
  'whatsapp',
  'sms',
  'email',
  'call',
  'site_visit'
);

CREATE TYPE followup_status AS ENUM (
  'pending',
  'completed',
  'snoozed',
  'cancelled'
);

CREATE TYPE attendance_status AS ENUM (
  'present',
  'late',
  'absent',
  'half_day',
  'on_leave'
);

CREATE TYPE social_post_type AS ENUM (
  'instagram_reel',
  'instagram_post',
  'facebook_post',
  'linkedin_post',
  'story'
);

CREATE TYPE social_post_status AS ENUM (
  'idea',
  'draft',
  'scheduled',
  'published'
);

CREATE TYPE activity_type AS ENUM (
  'lead_created',
  'lead_assigned',
  'lead_status_changed',
  'call_made',
  'call_received',
  'call_missed',
  'message_sent',
  'email_sent',
  'note_added',
  'followup_created',
  'followup_completed',
  'property_shared',
  'site_visit_scheduled',
  'site_visit_completed',
  'attendance_checkin',
  'attendance_checkout'
);

CREATE TYPE notification_type AS ENUM (
  'lead_assigned',
  'call_missed',
  'followup_due',
  'site_visit_scheduled',
  'property_shared',
  'attendance_issue',
  'social_post_due'
);

CREATE TYPE call_outcome AS ENUM (
  'connected',
  'no_answer',
  'busy',
  'voicemail',
  'wrong_number',
  'not_interested',
  'interested',
  'callback_requested',
  'pending'
);

CREATE TYPE assignment_mode AS ENUM (
  'round_robin',
  'manual',
  'least_busy'
);

-- ============================================================
-- ORGANIZATIONS TABLE
-- ============================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
