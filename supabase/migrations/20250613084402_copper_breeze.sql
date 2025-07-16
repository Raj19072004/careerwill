/*
  # Fix products table setup

  1. Tables
    - Ensure `products` table exists with all required columns
    - Handle existing table gracefully

  2. Security
    - Drop and recreate policies to avoid conflicts
    - Enable RLS on products table
    - Add policies for public read and admin write access

  3. Sample Data
    - Insert sample products if they don't exist
*/

-- Ensure products table exists with all columns
DO $$
BEGIN
  -- Create table if it doesn't exist
  CREATE TABLE IF NOT EXISTS products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text NOT NULL,
    image_url text,
    benefits text[] DEFAULT '{}',
    price numeric(10,2) DEFAULT 0,
    is_available boolean DEFAULT false,
    category text DEFAULT 'skincare',
    ingredients text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'benefits'
  ) THEN
    ALTER TABLE products ADD COLUMN benefits text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'category'
  ) THEN
    ALTER TABLE products ADD COLUMN category text DEFAULT 'skincare';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'ingredients'
  ) THEN
    ALTER TABLE products ADD COLUMN ingredients text;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

-- Create policies
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- Create or replace the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_products_updated_at ON products;

-- Create trigger
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products only if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
    INSERT INTO products (name, description, image_url, benefits, price, is_available, category, ingredients) VALUES
    ('Herbal Face Wash', 'Gentle cleansing with natural herbs and botanical extracts', 'https://images.pexels.com/photos/7755515/pexels-photo-7755515.jpeg', ARRAY['Deep Cleansing', 'Pore Minimizing', 'pH Balanced'], 24.99, false, 'face-wash', 'Green Tea Extract, Chamomile, Aloe Vera, Natural Glycerin'),
    ('Exfoliating Scrub', 'Natural exfoliation with organic ingredients for smooth skin', 'https://images.pexels.com/photos/6621374/pexels-photo-6621374.jpeg', ARRAY['Dead Skin Removal', 'Skin Brightening', 'Natural Glow'], 29.99, false, 'scrub', 'Walnut Shell Powder, Honey, Oatmeal, Jojoba Oil'),
    ('Vitamin C Serum', 'Brightening serum with natural vitamin C and antioxidants', 'https://images.pexels.com/photos/7755508/pexels-photo-7755508.jpeg', ARRAY['Anti-Aging', 'Brightening', 'Antioxidant Rich'], 39.99, false, 'serum', 'Kakadu Plum, Rose Hip Oil, Hyaluronic Acid, Vitamin E'),
    ('Hydrating Moisturizer', 'Deep hydration with herbal extracts and natural oils', 'https://images.pexels.com/photos/7755516/pexels-photo-7755516.jpeg', ARRAY['24h Hydration', 'Skin Barrier', 'Non-Greasy'], 34.99, false, 'moisturizer', 'Shea Butter, Ceramides, Squalane, Botanical Extracts'),
    ('Eye Cream', 'Gentle care for delicate eye area with natural peptides', 'https://images.pexels.com/photos/6621371/pexels-photo-6621371.jpeg', ARRAY['Dark Circle Reduction', 'Anti-Puffiness', 'Fine Line Care'], 44.99, false, 'eye-cream', 'Caffeine, Peptides, Cucumber Extract, Retinol Alternative'),
    ('Night Repair Mask', 'Overnight treatment with powerful herbal actives', 'https://images.pexels.com/photos/7755509/pexels-photo-7755509.jpeg', ARRAY['Overnight Repair', 'Deep Nourishment', 'Skin Renewal'], 49.99, false, 'mask', 'Ginseng, Snail Mucin, Niacinamide, Centella Asiatica');
  END IF;
END $$;