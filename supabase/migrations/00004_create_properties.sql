-- EstateFlow CRM: Migration 00004
-- Create properties, property_images, property_documents tables

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  property_type property_type NOT NULL,
  price BIGINT,
  price_per_sqft BIGINT,
  size_sqft INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  floor INTEGER,
  total_floors INTEGER,
  furnishing furnishing_status DEFAULT 'unfurnished',
  availability property_availability NOT NULL DEFAULT 'available',
  description TEXT,
  amenities TEXT[] DEFAULT '{}',
  owner_name TEXT,
  owner_phone TEXT,
  developer_name TEXT,
  project_name TEXT,
  units_available INTEGER DEFAULT 1,
  rera_number TEXT,
  internal_tags TEXT[] DEFAULT '{}',
  notes TEXT,
  share_slug TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_properties_organization ON properties(organization_id);
CREATE INDEX idx_properties_type ON properties(organization_id, property_type);
CREATE INDEX idx_properties_availability ON properties(organization_id, availability);
CREATE INDEX idx_properties_location ON properties(organization_id, location);
CREATE INDEX idx_properties_price ON properties(organization_id, price);
CREATE INDEX idx_properties_share_slug ON properties(share_slug);

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Property images
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_property_images_property ON property_images(property_id);

-- Property documents
CREATE TABLE property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT,
  file_type TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_property_documents_property ON property_documents(property_id);
