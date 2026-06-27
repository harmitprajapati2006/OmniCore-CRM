-- EstateFlow CRM: Migration 00010
-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_property_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;

-- Helper function: get user's organization_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (id = get_user_org_id());

CREATE POLICY "Admins can update their organization"
  ON organizations FOR UPDATE
  USING (id = get_user_org_id() AND get_user_role() = 'admin');

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "Users can view profiles in their organization"
  ON profiles FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles in their organization"
  ON profiles FOR ALL
  USING (organization_id = get_user_org_id() AND get_user_role() = 'admin');

-- ============================================================
-- LEADS
-- ============================================================
CREATE POLICY "Users can view leads in their organization"
  ON leads FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can insert leads in their organization"
  ON leads FOR INSERT
  WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "Users can update leads in their organization"
  ON leads FOR UPDATE
  USING (organization_id = get_user_org_id());

CREATE POLICY "Admins and managers can delete leads"
  ON leads FOR DELETE
  USING (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('admin', 'sales_manager')
  );

-- ============================================================
-- PROPERTIES
-- ============================================================
CREATE POLICY "Users can view properties in their organization"
  ON properties FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can insert properties"
  ON properties FOR INSERT
  WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "Users can update properties in their organization"
  ON properties FOR UPDATE
  USING (organization_id = get_user_org_id());

CREATE POLICY "Admins can delete properties"
  ON properties FOR DELETE
  USING (organization_id = get_user_org_id() AND get_user_role() = 'admin');

-- Public access for share links
CREATE POLICY "Anyone can view properties by share_slug"
  ON properties FOR SELECT
  USING (share_slug IS NOT NULL);

-- ============================================================
-- PROPERTY IMAGES
-- ============================================================
CREATE POLICY "Users can view property images in their organization"
  ON property_images FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can manage property images in their organization"
  ON property_images FOR ALL
  USING (organization_id = get_user_org_id());

-- Public access for shared properties
CREATE POLICY "Anyone can view images of shared properties"
  ON property_images FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE share_slug IS NOT NULL
    )
  );

-- ============================================================
-- PROPERTY DOCUMENTS
-- ============================================================
CREATE POLICY "Users can view property documents in their organization"
  ON property_documents FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can manage property documents in their organization"
  ON property_documents FOR ALL
  USING (organization_id = get_user_org_id());

-- ============================================================
-- ACTIVITIES
-- ============================================================
CREATE POLICY "Users can view activities in their organization"
  ON activities FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can insert activities"
  ON activities FOR INSERT
  WITH CHECK (organization_id = get_user_org_id());

-- ============================================================
-- CALLS
-- ============================================================
CREATE POLICY "Users can view calls in their organization"
  ON calls FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can insert calls"
  ON calls FOR INSERT
  WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "Users can update calls in their organization"
  ON calls FOR UPDATE
  USING (organization_id = get_user_org_id());

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE POLICY "Users can view messages in their organization"
  ON messages FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can insert messages"
  ON messages FOR INSERT
  WITH CHECK (organization_id = get_user_org_id());

-- ============================================================
-- LEAD PROPERTY SHARES
-- ============================================================
CREATE POLICY "Users can view shares in their organization"
  ON lead_property_shares FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can create shares"
  ON lead_property_shares FOR INSERT
  WITH CHECK (organization_id = get_user_org_id());

-- ============================================================
-- FOLLOWUPS
-- ============================================================
CREATE POLICY "Users can view followups in their organization"
  ON followups FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can insert followups"
  ON followups FOR INSERT
  WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "Users can update followups in their organization"
  ON followups FOR UPDATE
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can delete followups in their organization"
  ON followups FOR DELETE
  USING (organization_id = get_user_org_id());

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE POLICY "Users can view attendance in their organization"
  ON attendance FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can insert their own attendance"
  ON attendance FOR INSERT
  WITH CHECK (organization_id = get_user_org_id() AND user_id = auth.uid());

CREATE POLICY "Users can update their own attendance"
  ON attendance FOR UPDATE
  USING (organization_id = get_user_org_id() AND user_id = auth.uid());

-- ============================================================
-- SOCIAL POSTS
-- ============================================================
CREATE POLICY "Users can view social posts in their organization"
  ON social_posts FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can manage social posts in their organization"
  ON social_posts FOR ALL
  USING (organization_id = get_user_org_id());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (organization_id = get_user_org_id());

-- ============================================================
-- TASKS
-- ============================================================
CREATE POLICY "Users can view tasks in their organization"
  ON tasks FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can manage tasks in their organization"
  ON tasks FOR ALL
  USING (organization_id = get_user_org_id());

-- ============================================================
-- INTEGRATION SETTINGS
-- ============================================================
CREATE POLICY "Admins can manage integration settings"
  ON integration_settings FOR ALL
  USING (
    organization_id = get_user_org_id()
    AND get_user_role() = 'admin'
  );

CREATE POLICY "Users can view non-secret integration settings"
  ON integration_settings FOR SELECT
  USING (
    organization_id = get_user_org_id()
    AND is_secret = false
  );
