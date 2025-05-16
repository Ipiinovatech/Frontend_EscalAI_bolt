/*
  # Role-based Access Control Schema

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text)
      - `status` (text)
      - `plan` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `client_id` (uuid, references clients)
      - `role` (text)
      - `name` (text)
      - `avatar_url` (text)
      - `language` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  plan text NOT NULL DEFAULT 'basic',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'suspended')),
  CONSTRAINT valid_plan CHECK (plan IN ('basic', 'professional', 'enterprise'))
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  client_id uuid REFERENCES clients ON DELETE CASCADE,
  role text NOT NULL,
  name text NOT NULL,
  avatar_url text,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('platform_admin', 'client_supervisor', 'client_agent', 'client_executive', 'external_client')),
  CONSTRAINT valid_language CHECK (language IN ('en', 'es'))
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for clients table
CREATE POLICY "Platform admins can manage clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'platform_admin'
  ));

CREATE POLICY "Users can view their own client"
  ON clients
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT client_id FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- Policies for profiles table
CREATE POLICY "Platform admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.role = 'platform_admin'
    )
  );

CREATE POLICY "Supervisors can manage profiles in their client"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS supervisor_profile
      WHERE supervisor_profile.id = auth.uid()
      AND supervisor_profile.role = 'client_supervisor'
      AND supervisor_profile.client_id = client_id
    )
  );

CREATE POLICY "Users can view profiles in their client"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT p.client_id FROM profiles p
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Update tickets table to include client_id
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id);

-- Update tickets RLS policies
DROP POLICY IF EXISTS "Users can create their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;

CREATE POLICY "Users can create tickets for their client"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT p.client_id FROM profiles p
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Users can view tickets in their client"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT p.client_id FROM profiles p
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Users can update tickets in their client"
  ON tickets
  FOR UPDATE
  TO authenticated
  USING (
    client_id IN (
      SELECT p.client_id FROM profiles p
      WHERE p.id = auth.uid()
    )
  );

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();