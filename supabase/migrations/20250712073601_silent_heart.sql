/*
  # Add payment_method column to orders table

  1. Changes
    - Add `payment_method` column to `orders` table
    - Column will store payment method type (card, upi, cod)
    - Set default value to 'cod' for existing records

  2. Security
    - No changes to RLS policies needed
    - Column follows existing table permissions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method text DEFAULT 'cod';
  END IF;
END $$;