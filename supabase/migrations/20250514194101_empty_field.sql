/*
  # Update profiles schema with role management and status
  
  1. Changes
    - Add status column to profiles
    - Create user roles
    - Make role a foreign key to user_roles
    - Add status constraints and policies
    
  2. Security
    - Maintain RLS policies
    - Add status checking for authentication
*/

-- First, ensure user_roles table has the necessary roles
INSERT INTO user_roles (name, description) VALUES
  ('platform_admin', 'Platform Administrator'),
  ('client_supervisor', 'Client Supervisor'),
  ('client_agent', 'Client Agent'),
  ('client_executive', 'Client Executive'),
  ('external_client', 'External Client')
ON CONFLICT (name) DO NOTHING;

-- Temporarily disable the role constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS valid_role;

-- Add status column to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Add status constraint
ALTER TABLE profiles
ADD CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'suspended'));

-- Update existing profiles to use valid roles
UPDATE profiles
SET role = 'platform_admin'
WHERE role NOT IN (
  SELECT name FROM user_roles
);

-- Now make role a foreign key to user_roles.name
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_fkey 
FOREIGN KEY (role) REFERENCES user_roles(name) ON UPDATE CASCADE;

-- Add policies for status management
CREATE POLICY "Platform admins can manage profile status"
ON profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'platform_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'platform_admin'
  )
);

-- Create or replace function to check user status
CREATE OR REPLACE FUNCTION public.handle_auth_user_status()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND status != 'active'
  ) THEN
    RAISE EXCEPTION 'User account is not active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for status checking
DROP TRIGGER IF EXISTS on_auth_user_status ON auth.users;
CREATE TRIGGER on_auth_user_status
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_status();