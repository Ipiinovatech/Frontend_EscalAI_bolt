/*
  # Add user role relations

  1. Changes
    - Create user_role_assignments table to store user-role relationships
    - Add foreign key constraints
    - Add RLS policies for security
    - Add triggers for updated_at

  2. Security
    - Enable RLS
    - Add policies for platform admins
    - Add policies for viewing own roles
*/

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

-- Create policies
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

-- Create updated_at trigger
CREATE TRIGGER update_user_role_assignments_updated_at
  BEFORE UPDATE ON user_role_assignments
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();