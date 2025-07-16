/*
  # Add coupon and discount fields to orders table

  1. Changes to orders table
    - Add `coupon_code` column (text, nullable) to store applied coupon codes
    - Add `discount_amount` column (numeric, default 0) to store discount amounts

  2. Security
    - No changes to existing RLS policies needed
    - New columns inherit existing table permissions
*/

-- Add coupon_code column to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'coupon_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN coupon_code text;
  END IF;
END $$;

-- Add discount_amount column to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN discount_amount numeric(10,2) DEFAULT 0;
  END IF;
END $$;