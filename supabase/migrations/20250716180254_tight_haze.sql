/*
  # Make mandhata user an admin

  1. Updates
    - Find user with email containing 'mandhata' and update their role to 'admin'
    - Updates both auth.users user_metadata and ensures consistency

  2. Security
    - Only updates users that exist
    - Preserves existing user_metadata while updating role
*/

-- Update user role to admin for mandhata user
UPDATE auth.users 
SET user_metadata = COALESCE(user_metadata, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email ILIKE '%mandhata%' 
AND email IS NOT NULL;

-- Verify the update (this will show in logs)
DO $$
DECLARE
    updated_count INTEGER;
    user_record RECORD;
BEGIN
    -- Count updated users
    SELECT COUNT(*) INTO updated_count
    FROM auth.users 
    WHERE email ILIKE '%mandhata%' 
    AND user_metadata->>'role' = 'admin';
    
    -- Log the result
    RAISE NOTICE 'Updated % user(s) to admin role', updated_count;
    
    -- Show updated user details
    FOR user_record IN 
        SELECT email, user_metadata->>'role' as role, created_at
        FROM auth.users 
        WHERE email ILIKE '%mandhata%'
    LOOP
        RAISE NOTICE 'User: % | Role: % | Created: %', user_record.email, user_record.role, user_record.created_at;
    END LOOP;
END $$;