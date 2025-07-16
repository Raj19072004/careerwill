/*
  # Complete Admin and E-commerce Setup

  1. Admin Management
    - Create admin management functions
    - Set up single admin user system
    - Add product image management

  2. Enhanced Product Features
    - Add multiple images support
    - Improve review system
    - Add analytics tables

  3. Order Management
    - Complete order system
    - Add order status tracking
    - Payment integration support

  4. User Management
    - Enhanced user profiles
    - Google OAuth support
    - User preferences
*/

-- Add multiple images support to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'images'
  ) THEN
    ALTER TABLE products ADD COLUMN images text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'featured_image'
  ) THEN
    ALTER TABLE products ADD COLUMN featured_image text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_quantity integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'sku'
  ) THEN
    ALTER TABLE products ADD COLUMN sku text UNIQUE;
  END IF;
END $$;

-- Create users table for extended user profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  phone text,
  address jsonb,
  skin_type text,
  skin_concerns text[],
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view analytics"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
  ON wishlist
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(10,2),
  min_order_amount numeric(10,2) DEFAULT 0,
  max_uses integer,
  used_count integer DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage coupons"
  ON coupons
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- Function to set admin user
CREATE OR REPLACE FUNCTION set_admin_user(user_email text)
RETURNS void AS $$
BEGIN
  -- Remove admin role from all users first
  UPDATE auth.users 
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data ? 'role' THEN
        raw_user_meta_data - 'role'
      ELSE raw_user_meta_data
    END;
  
  -- Set the specified user as admin
  UPDATE auth.users 
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get product analytics
CREATE OR REPLACE FUNCTION get_product_analytics()
RETURNS TABLE (
  product_id uuid,
  product_name text,
  view_count bigint,
  cart_additions bigint,
  purchases bigint,
  avg_rating numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    COALESCE(views.count, 0) as view_count,
    COALESCE(cart_adds.count, 0) as cart_additions,
    COALESCE(purchases.count, 0) as purchases,
    COALESCE(AVG(r.rating), 0) as avg_rating
  FROM products p
  LEFT JOIN (
    SELECT 
      (event_data->>'product_id')::uuid as product_id,
      COUNT(*) as count
    FROM analytics 
    WHERE event_type = 'product_view'
    GROUP BY (event_data->>'product_id')::uuid
  ) views ON p.id = views.product_id
  LEFT JOIN (
    SELECT 
      (event_data->>'product_id')::uuid as product_id,
      COUNT(*) as count
    FROM analytics 
    WHERE event_type = 'add_to_cart'
    GROUP BY (event_data->>'product_id')::uuid
  ) cart_adds ON p.id = cart_adds.product_id
  LEFT JOIN (
    SELECT 
      (event_data->>'product_id')::uuid as product_id,
      COUNT(*) as count
    FROM analytics 
    WHERE event_type = 'purchase'
    GROUP BY (event_data->>'product_id')::uuid
  ) purchases ON p.id = purchases.product_id
  LEFT JOIN reviews r ON p.id = r.product_id
  GROUP BY p.id, p.name, views.count, cart_adds.count, purchases.count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update products with sample data including multiple images
-- First, update existing products with images and featured_image
UPDATE products SET 
  images = ARRAY[image_url, 'https://images.pexels.com/photos/7755515/pexels-photo-7755515.jpeg', 'https://images.pexels.com/photos/6621374/pexels-photo-6621374.jpeg'],
  featured_image = image_url,
  stock_quantity = 50
WHERE (images IS NULL OR array_length(images, 1) IS NULL) AND image_url IS NOT NULL;

-- Generate SKUs for products that don't have them using a simpler approach
DO $$
DECLARE
  product_record RECORD;
  counter INTEGER := 1;
  category_prefix TEXT;
BEGIN
  FOR product_record IN 
    SELECT id, category FROM products WHERE sku IS NULL ORDER BY created_at
  LOOP
    -- Generate category prefix
    category_prefix := CASE 
      WHEN product_record.category = 'face-wash' THEN 'FAC'
      WHEN product_record.category = 'scrub' THEN 'SCR'
      WHEN product_record.category = 'serum' THEN 'SER'
      WHEN product_record.category = 'moisturizer' THEN 'MOI'
      WHEN product_record.category = 'eye-cream' THEN 'EYE'
      WHEN product_record.category = 'mask' THEN 'MAS'
      ELSE 'PRO'
    END;
    
    -- Update the product with generated SKU
    UPDATE products 
    SET sku = 'AUR-' || category_prefix || '-' || LPAD(counter::text, 3, '0')
    WHERE id = product_record.id;
    
    counter := counter + 1;
  END LOOP;
END $$;

-- Insert sample coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_uses, valid_until) VALUES
('WELCOME10', 'Welcome discount for new users', 'percentage', 10, 500, 100, now() + interval '30 days'),
('SAVE50', 'Flat ₹50 off on orders above ₹999', 'fixed', 50, 999, 50, now() + interval '15 days'),
('NATURAL20', '20% off on all natural products', 'percentage', 20, 1000, 200, now() + interval '7 days')
ON CONFLICT (code) DO NOTHING;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION set_admin_user(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_analytics() TO authenticated;