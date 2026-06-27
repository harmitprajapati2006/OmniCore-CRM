-- EstateFlow CRM: Migration 00011
-- Seed data for development and testing

-- ============================================================
-- 1. ORGANIZATION
-- ============================================================
INSERT INTO organizations (id, name, slug, phone, email, website, address) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Skyline Realty Group', 'skyline-realty', '+919876543210', 'admin@skylinerealty.com', 'https://skylinerealty.com', 'Golf Course Road, Gurgaon, Haryana');

-- ============================================================
-- 2. USERS (created via Supabase Auth, profiles reference them)
-- NOTE: In production, these users are created through the auth flow.
-- For local dev seeding, insert directly into auth.users then profiles.
-- Use supabase dashboard or seed script to create these auth users.
-- ============================================================

-- We'll use fixed UUIDs so they can be referenced in sample data.
-- In production, these would be created through signup flow.

-- For now, we just insert the profiles. The auth.users entries
-- need to be created via Supabase Auth API or dashboard.

-- We'll create a helper function to seed (won't actually insert auth.users 
-- in a migration - that's done via the seed script)

-- ============================================================
-- 3. SAMPLE PROPERTIES
-- ============================================================
INSERT INTO properties (id, organization_id, title, location, address, property_type, price, size_sqft, bedrooms, bathrooms, floor, total_floors, furnishing, availability, description, amenities, developer_name, project_name, units_available, share_slug) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Luxury 3BHK in DLF Phase 5', 'Gurgaon', 'DLF Phase 5, Sector 43, Gurgaon', 'apartment', 15000000, 1800, 3, 3, 12, 25, 'semi_furnished', 'available', 'Spacious 3BHK apartment with panoramic views of the Aravalli hills. Modern interiors with modular kitchen, wooden flooring in bedrooms, and premium bathroom fittings.', ARRAY['Swimming Pool', 'Gym', 'Clubhouse', 'Park', '24x7 Security', 'Power Backup', 'Parking'], 'DLF Limited', 'DLF The Crest', 5, 'dlf-crest-3bhk'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Premium Villa in Sohna', 'Sohna', 'Sohna Road, Near KMP Expressway, Gurgaon', 'villa', 35000000, 4500, 5, 5, 0, 3, 'fully_furnished', 'available', 'Luxurious independent villa with private garden, terrace pool, and smart home automation. Italian marble flooring throughout.', ARRAY['Private Pool', 'Garden', 'Smart Home', 'Modular Kitchen', 'Home Theater', 'Parking'], 'Emaar India', 'Emaar Marbella', 3, 'emaar-villa-sohna'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Commercial Office Space in Cyber Hub', 'Gurgaon', 'DLF Cyber City, Phase 2, Gurgaon', 'commercial', 8500000, 1200, 0, 2, 8, 15, 'unfurnished', 'available', 'Premium Grade A office space in the heart of Cyber City. Ideal for IT companies and startups. Excellent connectivity to metro.', ARRAY['Cafeteria', 'Conference Room', 'High-speed Elevator', 'Central AC', 'Fire Safety', 'Parking'], 'DLF Limited', 'DLF Cyber City', 10, 'cyber-hub-office'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '2BHK Apartment in Sector 82', 'Gurgaon', 'Sector 82, New Gurgaon', 'apartment', 7500000, 1100, 2, 2, 5, 14, 'unfurnished', 'available', 'Affordable 2BHK in rapidly developing New Gurgaon. Close to Dwarka Expressway with excellent appreciation potential.', ARRAY['Park', 'Gym', 'Children Play Area', 'Security', 'Parking'], 'Godrej Properties', 'Godrej Aria', 20, 'godrej-aria-2bhk'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Residential Plot in Sector 95', 'Gurgaon', 'Sector 95, Gurgaon', 'plot', 12000000, 2400, 0, 0, 0, 0, 'unfurnished', 'available', '300 sq yard residential plot in HUDA approved sector. Corner plot with excellent road frontage. Ideal for building custom home.', ARRAY['HUDA Approved', 'Corner Plot', 'Wide Road', 'Park Facing'], NULL, NULL, 1, 'sector-95-plot'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', '4BHK Penthouse in Golf Course Road', 'Gurgaon', 'Golf Course Road, DLF Phase 4, Gurgaon', 'apartment', 45000000, 5200, 4, 5, 28, 30, 'fully_furnished', 'available', 'Ultra-luxury penthouse with private terrace, jacuzzi, and 360-degree city views. Italian marble, imported fittings, and home automation.', ARRAY['Private Terrace', 'Jacuzzi', 'Concierge', 'Valet Parking', 'Wine Cellar', 'Smart Home'], 'M3M', 'M3M Golf Estate', 2, 'm3m-penthouse'),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', '3BHK in Noida Extension', 'Noida', 'Sector 1, Greater Noida West', 'apartment', 5500000, 1400, 3, 2, 7, 18, 'semi_furnished', 'available', 'Well-designed 3BHK with excellent ventilation and green views. Near proposed metro line and established schools.', ARRAY['Swimming Pool', 'Gym', 'Jogging Track', 'Indoor Games', 'Security'], 'ATS', 'ATS Pristine', 15, 'ats-noida-3bhk'),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Rental 2BHK in Dwarka', 'Delhi', 'Sector 6, Dwarka, New Delhi', 'rental', 25000, 950, 2, 2, 3, 4, 'fully_furnished', 'available', 'Fully furnished 2BHK apartment for rent. Near Dwarka Sector 6 Metro station. All modern amenities included.', ARRAY['Metro Adjacent', 'Furnished', 'Market Nearby', 'Parking'], NULL, NULL, 1, 'dwarka-2bhk-rent'),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Luxury 3BHK in Whitefield', 'Bangalore', 'Whitefield Main Road, Bangalore', 'apartment', 18000000, 2100, 3, 3, 15, 22, 'semi_furnished', 'hold', 'Premium 3BHK in Bangalore IT hub. Walking distance to IT parks. World-class amenities and excellent connectivity.', ARRAY['Clubhouse', 'Tennis Court', 'Swimming Pool', 'Gym', 'Jogging Track', 'Security'], 'Prestige', 'Prestige Shantiniketan', 8, 'prestige-whitefield'),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Farm House in Chattarpur', 'Delhi', 'Chattarpur, South Delhi', 'villa', 90000000, 10000, 6, 8, 0, 2, 'fully_furnished', 'available', 'Magnificent farmhouse with lush gardens, private pool, and entertainment area. Perfect for large families or corporate retreats.', ARRAY['Private Pool', 'Garden', 'Party Lawn', 'Staff Quarters', 'Generator', 'Borewell'], NULL, NULL, 1, 'chattarpur-farmhouse');

-- ============================================================
-- 4. SAMPLE PROPERTY IMAGES (placeholder URLs)
-- ============================================================
INSERT INTO property_images (property_id, organization_id, url, caption, is_primary, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/prop1a/800/600', 'Living Room', true, 0),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/prop1b/800/600', 'Bedroom', false, 1),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/prop1c/800/600', 'Kitchen', false, 2),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/prop2a/800/600', 'Villa Exterior', true, 0),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/prop2b/800/600', 'Pool Area', false, 1),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/prop3a/800/600', 'Office Space', true, 0),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/prop4a/800/600', 'Exterior View', true, 0),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/prop5a/800/600', 'Plot View', true, 0),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/prop6a/800/600', 'Penthouse Terrace', true, 0),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/prop6b/800/600', 'Living Area', false, 1),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/prop7a/800/600', 'Apartment View', true, 0),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/prop8a/800/600', 'Furnished Room', true, 0),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/prop9a/800/600', 'Building Facade', true, 0),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/prop10a/800/600', 'Farm House Entrance', true, 0),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/prop10b/800/600', 'Garden View', false, 1);
