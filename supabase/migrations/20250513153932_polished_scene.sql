/*
  # Fix Initial Data Setup

  1. Changes
    - Clean up duplicate demo clients
    - Set up initial admin profile correctly
    - Update RLS policies

  2. Security
    - Maintain RLS on all tables
    - Ensure proper access control
*/

-- First, clean up any existing demo clients
DELETE FROM clients WHERE name = 'Cliente Demo';

-- Create a new demo client with a specific ID
INSERT INTO clients (id, name, status, plan)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Cliente Demo',
    'active',
    'professional'
) ON CONFLICT (id) DO NOTHING;

-- Create client for ia@example.com
INSERT INTO clients (id, name, status, plan)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'IA Client',
    'active',
    'professional'
) ON CONFLICT (id) DO NOTHING;

-- Create admin profile if it doesn't exist
INSERT INTO profiles (id, name, role, language)
VALUES (
    'd894b0a5-c26e-4f36-82b9-b0f6080670b7',
    'System Administrator',
    'platform_admin',
    'en'
) ON CONFLICT (id) DO UPDATE 
SET role = 'platform_admin',
    name = 'System Administrator';

-- Create profile for ia@example.com using existing user ID
INSERT INTO profiles (id, client_id, name, role, language)
VALUES (
    '51510e5c-a085-4da4-848b-2cbf180cec01',
    '00000000-0000-0000-0000-000000000002',
    'IA User',
    'external_client',
    'es'
) ON CONFLICT (id) DO UPDATE 
SET role = 'external_client',
    name = 'IA User',
    client_id = '00000000-0000-0000-0000-000000000002';

-- Update RLS policies for profiles
DROP POLICY IF EXISTS "Enable insert for authentication service" ON profiles;
CREATE POLICY "Enable insert for authentication service"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update RLS policies for clients
DROP POLICY IF EXISTS "Platform admins can manage clients" ON clients;
CREATE POLICY "Platform admins can manage clients"
ON clients
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'platform_admin'
  )
);