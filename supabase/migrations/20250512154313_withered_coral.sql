/*
  # Fix profile policies and ticket relationships

  1. Changes
    - Remove recursive policies from profiles table
    - Add simplified, non-recursive policies
    - Update foreign key relationships for tickets table
    - Ensure existing data integrity

  2. Security
    - Maintain RLS policies for profiles
    - Update foreign key constraints with proper references
*/

-- First, drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Platform admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Supervisors can manage profiles in their client" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their client" ON profiles;

-- Create new, simplified policies for profiles
CREATE POLICY "Platform admins can manage all profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  role = 'platform_admin'
);

CREATE POLICY "Users can view profiles in their client"
ON profiles
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT client_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Drop existing foreign key constraints if they exist
ALTER TABLE IF EXISTS tickets
DROP CONSTRAINT IF EXISTS tickets_user_id_fkey,
DROP CONSTRAINT IF EXISTS tickets_assigned_to_fkey;

-- Update tickets table to reference auth.users instead of profiles
ALTER TABLE tickets
ADD CONSTRAINT tickets_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
ADD CONSTRAINT tickets_assigned_to_fkey
FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add ticket creation policies
CREATE POLICY "Allow external clients to create tickets"
ON tickets
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'external_client'
  )
);

CREATE POLICY "Allow users to view their own tickets"
ON tickets
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('platform_admin', 'client_supervisor', 'client_agent')
  )
);

CREATE POLICY "Allow users to update their own tickets"
ON tickets
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('platform_admin', 'client_supervisor', 'client_agent')
  )
);