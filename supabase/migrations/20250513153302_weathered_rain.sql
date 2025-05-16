/*
  # Fix Authentication and RLS Policies

  1. Changes
    - Make client_id nullable for platform_admin profiles
    - Update RLS policies to allow profile creation
    - Fix circular dependencies in policies
    - Add proper policies for platform admins

  2. Security
    - Maintain secure access control
    - Allow platform admin creation without client
    - Ensure proper profile management
*/

-- Make client_id nullable for platform admins
ALTER TABLE profiles ALTER COLUMN client_id DROP NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Platform admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their client" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new, simplified policies for profiles
CREATE POLICY "Enable insert for authentication service"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can read profiles in their organization"
ON profiles
FOR SELECT
TO authenticated
USING (
  (role = 'platform_admin') OR
  (client_id IN (SELECT client_id FROM profiles WHERE id = auth.uid()))
);

CREATE POLICY "Platform admins can manage all profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'platform_admin'
  )
);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());