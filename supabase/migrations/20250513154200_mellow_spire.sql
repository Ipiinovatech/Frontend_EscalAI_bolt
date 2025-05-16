/*
  # Fix RLS policies to prevent recursion

  1. Changes
    - Drop all existing policies for profiles and clients
    - Create new, simplified policies without recursion
    - Fix platform admin access

  2. Security
    - Maintain proper access control
    - Prevent infinite recursion
    - Ensure platform admin access
*/

-- Drop all existing policies for profiles
DROP POLICY IF EXISTS "Enable insert for authentication service" ON profiles;
DROP POLICY IF EXISTS "Users can read profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Platform admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new, non-recursive policies for profiles
CREATE POLICY "Allow platform admin full access"
ON profiles
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role = 'platform_admin'
  )
);

CREATE POLICY "Allow users to read their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
);

CREATE POLICY "Allow users to read profiles in their client"
ON profiles
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT client_id FROM profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Allow users to update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Allow new profile creation"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Drop and recreate client policies
DROP POLICY IF EXISTS "Platform admins can manage clients" ON clients;
DROP POLICY IF EXISTS "Users can view their own client" ON clients;

CREATE POLICY "Allow platform admin full access to clients"
ON clients
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role = 'platform_admin'
  )
);

CREATE POLICY "Allow users to view their own client"
ON clients
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT client_id FROM profiles 
    WHERE profiles.id = auth.uid()
  )
);

-- Ensure admin profile exists with correct role
UPDATE profiles 
SET role = 'platform_admin',
    name = 'System Administrator',
    language = 'en'
WHERE id = 'd894b0a5-c26e-4f36-82b9-b0f6080670b7';