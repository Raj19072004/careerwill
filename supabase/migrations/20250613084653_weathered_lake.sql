/*
  # Setup Admin User Functionality

  1. Create a function to promote users to admin
  2. Create a function to check if any admin exists
  3. Add sample admin user setup instructions
*/

-- Function to promote a user to admin role
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email text)
RETURNS void AS $$
BEGIN
  UPDATE auth.users 
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if any admin exists
CREATE OR REPLACE FUNCTION has_admin_user()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION promote_user_to_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION has_admin_user() TO authenticated, anon;