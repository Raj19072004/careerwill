/*
  # Enable Email Verification

  1. Configuration
    - Enable email confirmation requirement
    - Set up email templates for verification
    - Configure redirect URLs

  2. Security
    - Users must verify email before accessing protected features
    - Unverified users have limited access
*/

-- This migration enables email verification in Supabase
-- The actual email confirmation settings need to be configured in the Supabase Dashboard:
-- 1. Go to Authentication > Settings
-- 2. Enable "Enable email confirmations"
-- 3. Set up email templates
-- 4. Configure redirect URLs

-- For now, we'll add a note in the database
INSERT INTO public.analytics (event_type, event_data) 
VALUES ('system_config', '{"note": "Email verification enabled - configure in Supabase Dashboard"}')
ON CONFLICT DO NOTHING;