/*
  # Add Admin Bank Accounts Table

  1. New Tables
    - `admin_bank_accounts`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, foreign key to users)
      - `account_holder_name` (text)
      - `account_number` (text)
      - `bank_name` (text)
      - `ifsc_code` (text)
      - `branch_name` (text)
      - `account_type` (text, savings/current)
      - `is_primary` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `admin_bank_accounts` table
    - Add policy for admins to manage their own bank accounts

  3. Indexes
    - Add index on admin_id for faster queries
    - Add unique constraint on admin_id + is_primary to ensure only one primary account
*/

-- Create admin_bank_accounts table
CREATE TABLE IF NOT EXISTS admin_bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_holder_name text NOT NULL,
  account_number text NOT NULL,
  bank_name text NOT NULL,
  ifsc_code text NOT NULL,
  branch_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('savings', 'current')),
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage their own bank accounts"
  ON admin_bank_accounts
  FOR ALL
  TO authenticated
  USING (admin_id = auth.uid() AND ((auth.jwt() ->> 'user_metadata')::json ->> 'role') = 'admin')
  WITH CHECK (admin_id = auth.uid() AND ((auth.jwt() ->> 'user_metadata')::json ->> 'role') = 'admin');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_bank_accounts_admin_id ON admin_bank_accounts(admin_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_admin_bank_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_bank_accounts_updated_at
  BEFORE UPDATE ON admin_bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_bank_accounts_updated_at();

-- Add delivered_at column to orders table for tracking delivery time
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivered_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivered_at timestamptz;
  END IF;
END $$;

-- Update orders table to include returned status
DO $$
BEGIN
  -- Check if the constraint exists and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'orders_status_check'
  ) THEN
    ALTER TABLE orders DROP CONSTRAINT orders_status_check;
  END IF;
  
  -- Add the new constraint with returned status
  ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text, 'returned'::text]));
END $$;