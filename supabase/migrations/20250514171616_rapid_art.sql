/*
  # Create UserRole table and default roles

  1. New Tables
    - `user_roles`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_roles` table
    - Add policies for platform admins and users
*/

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

-- Create policies
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

-- Create updated_at trigger
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Insert default roles
INSERT INTO user_roles (name, description) VALUES
  ('platform_admin', 'Administrador de la plataforma'),
  ('client_supervisor', 'Supervisor de cliente'),
  ('client_agent', 'Agente de cliente'),
  ('client_executive', 'Ejecutivo de cliente'),
  ('external_client', 'Cliente externo')
ON CONFLICT (name) DO NOTHING;