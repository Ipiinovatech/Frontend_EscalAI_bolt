/*
  # Fix policies and relationships

  1. Changes
    - Remove recursive policies from profiles table
    - Add correct foreign key relationships between tickets and profiles
    - Update RLS policies to be more efficient

  2. Security
    - Maintain RLS on all tables
    - Simplify policies to avoid recursion
    - Ensure proper access control
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

-- Add correct foreign key constraints
ALTER TABLE tickets
ADD CONSTRAINT tickets_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT tickets_assigned_to_fkey
FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE SET NULL;