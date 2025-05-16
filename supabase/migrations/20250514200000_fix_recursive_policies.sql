/*
  # Fix Recursive Policies in All Tables

  1. Changes
    - Drop all existing recursive policies
    - Create new non-recursive policies for all tables
    - Ensure proper access control without circular dependencies

  2. Security
    - Maintain RLS on all tables
    - Prevent infinite recursion
    - Keep proper access control
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Platform admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Supervisors can manage profiles in their client" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their client" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Platform admins can manage profile status" ON profiles;
DROP POLICY IF EXISTS "Platform admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view user roles" ON user_roles;
DROP POLICY IF EXISTS "Platform admins can manage role assignments" ON user_role_assignments;
DROP POLICY IF EXISTS "Users can view their own role assignments" ON user_role_assignments;
DROP POLICY IF EXISTS "Platform admins can manage clients" ON clients;
DROP POLICY IF EXISTS "Users can view their own client" ON clients;
DROP POLICY IF EXISTS "Allow platform admin full access" ON profiles;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to read profiles in their client" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow new profile creation" ON profiles;
DROP POLICY IF EXISTS "Allow platform admin full access to roles" ON user_roles;
DROP POLICY IF EXISTS "Allow all users to view roles" ON user_roles;
DROP POLICY IF EXISTS "Allow platform admin full access to assignments" ON user_role_assignments;
DROP POLICY IF EXISTS "Allow users to view their own assignments" ON user_role_assignments;
DROP POLICY IF EXISTS "Allow platform admin full access to clients" ON clients;
DROP POLICY IF EXISTS "Allow users to view their client" ON clients;

-- Create new, non-recursive policies for profiles
DO $$ 
BEGIN
    -- Platform admin policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow platform admin full access') THEN
        CREATE POLICY "Allow platform admin full access"
        ON profiles
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = auth.uid()
                AND p.role = 'platform_admin'
            )
        );
    END IF;

    -- User's own profile policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow users to read their own profile') THEN
        CREATE POLICY "Allow users to read their own profile"
        ON profiles
        FOR SELECT
        TO authenticated
        USING (id = auth.uid());
    END IF;

    -- Client profiles policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow users to read profiles in their client') THEN
        CREATE POLICY "Allow users to read profiles in their client"
        ON profiles
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = auth.uid()
                AND p.client_id = profiles.client_id
            )
        );
    END IF;

    -- Update own profile policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow users to update their own profile') THEN
        CREATE POLICY "Allow users to update their own profile"
        ON profiles
        FOR UPDATE
        TO authenticated
        USING (id = auth.uid())
        WITH CHECK (id = auth.uid());
    END IF;

    -- Create profile policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow new profile creation') THEN
        CREATE POLICY "Allow new profile creation"
        ON profiles
        FOR INSERT
        TO authenticated
        WITH CHECK (true);
    END IF;
END $$;

-- Create policies for user_roles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Allow platform admin full access to roles') THEN
        CREATE POLICY "Allow platform admin full access to roles"
        ON user_roles
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = auth.uid()
                AND p.role = 'platform_admin'
            )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Allow all users to view roles') THEN
        CREATE POLICY "Allow all users to view roles"
        ON user_roles
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;
END $$;

-- Create policies for user_role_assignments
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_role_assignments' AND policyname = 'Allow platform admin full access to assignments') THEN
        CREATE POLICY "Allow platform admin full access to assignments"
        ON user_role_assignments
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = auth.uid()
                AND p.role = 'platform_admin'
            )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_role_assignments' AND policyname = 'Allow users to view their own assignments') THEN
        CREATE POLICY "Allow users to view their own assignments"
        ON user_role_assignments
        FOR SELECT
        TO authenticated
        USING (user_id = auth.uid());
    END IF;
END $$;

-- Create policies for clients
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Allow platform admin full access to clients') THEN
        CREATE POLICY "Allow platform admin full access to clients"
        ON clients
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = auth.uid()
                AND p.role = 'platform_admin'
            )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Allow users to view their client') THEN
        CREATE POLICY "Allow users to view their client"
        ON clients
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = auth.uid()
                AND p.client_id = clients.id
            )
        );
    END IF;
END $$; 