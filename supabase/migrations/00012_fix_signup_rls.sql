-- EstateFlow CRM: Migration 00012
-- Fix RLS policies to allow signup (inserting org and profile)

-- Allow authenticated users to create a new organization
CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to create their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());
