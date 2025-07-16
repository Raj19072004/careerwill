/*
  # Create contact messages table

  1. New Tables
    - `contact_messages`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `subject` (text)
      - `message` (text)
      - `status` (text, default 'unread')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `contact_messages` table
    - Add policy for public to insert messages
    - Add policy for admins to read all messages
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can read all contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );