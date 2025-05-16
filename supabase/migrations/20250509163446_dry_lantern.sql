/*
  # Create tickets table and related schemas

  1. New Tables
    - `tickets`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `priority` (text)
      - `status` (text)
      - `type` (text)
      - `category` (text)
      - `subcategory` (text)
      - `user_id` (uuid, references auth.users)
      - `assigned_to` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `closed_at` (timestamptz)
      - `attachments` (text[])
      - `sla_due_at` (timestamptz)

  2. Security
    - Enable RLS on `tickets` table
    - Add policies for authenticated users to:
      - Create their own tickets
      - Read their own tickets
      - Update their own tickets
*/

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  type text NOT NULL,
  category text,
  subcategory text,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  attachments text[],
  sla_due_at timestamptz,
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'reopened', 'escalated')),
  CONSTRAINT valid_type CHECK (type IN ('petition', 'complaint', 'claim'))
);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own tickets"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
  ON tickets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE
  ON tickets
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();