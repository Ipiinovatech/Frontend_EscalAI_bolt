/*
  # Fix User Roles Schema

  1. Changes
    - Drop existing tables to clean up
    - Create user_roles table with proper constraints
    - Create user_role_assignments table with correct relationships
    - Add RLS policies for security
    - Add default roles

  2. Security
    - Enable RLS on all tables
    - Add proper policies for role management
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_role_assignments;
DROP TABLE IF EXISTS user_roles;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Platform admins can manage user roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'platform_admin'
  ));

CREATE POLICY "Users can view user roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create user_role_assignments table
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Enable RLS
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for user_role_assignments
CREATE POLICY "Platform admins can manage role assignments"
  ON user_role_assignments
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'platform_admin'
  ));

CREATE POLICY "Users can view their own role assignments"
  ON user_role_assignments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create updated_at triggers
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_role_assignments_updated_at
  BEFORE UPDATE ON user_role_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default roles
INSERT INTO user_roles (name, description) VALUES
  ('platform_admin', 'Administrador de la plataforma'),
  ('client_supervisor', 'Supervisor de cliente'),
  ('client_agent', 'Agente de cliente'),
  ('client_executive', 'Ejecutivo de cliente'),
  ('external_client', 'Cliente externo')
ON CONFLICT (name) DO NOTHING;