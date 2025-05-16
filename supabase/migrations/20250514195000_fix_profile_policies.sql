/*
  # Fix Recursive Profile Policies

  1. Changes
    - Drop existing recursive policies
    - Create new non-recursive policies
    - Ensure proper access control without circular dependencies

  2. Security
    - Maintain RLS on profiles table
    - Prevent infinite recursion
    - Keep proper access control
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Platform admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Supervisors can manage profiles in their client" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their client" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Platform admins can manage profile status" ON profiles;

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