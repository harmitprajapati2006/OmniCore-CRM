-- EstateFlow CRM: Migration 00008
-- Create social_posts table

CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  post_type social_post_type NOT NULL,
  status social_post_status NOT NULL DEFAULT 'idea',
  caption TEXT,
  media_urls TEXT[] DEFAULT '{}',
  storage_paths TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  publish_url TEXT,
  notes TEXT,
  ai_generated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_social_posts_organization ON social_posts(organization_id, status);
CREATE INDEX idx_social_posts_scheduled ON social_posts(organization_id, scheduled_at);
CREATE INDEX idx_social_posts_assigned ON social_posts(assigned_to);

CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
