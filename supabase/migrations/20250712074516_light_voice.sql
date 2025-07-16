/*
  # Add delivered_at column to orders table

  1. Changes
    - Add delivered_at timestamp column to track delivery time
    - This enables 24-hour cancellation and 48-hour return policies
  
  2. Security
    - Column is nullable as not all orders are delivered yet
    - Will be set when order status changes to 'delivered'
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'delivered_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivered_at timestamptz;
  END IF;
END $$;