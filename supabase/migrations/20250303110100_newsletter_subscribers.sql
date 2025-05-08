/*
  # Create newsletter_subscribers table

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, not null, unique)
      - `status` (text, not null) - 'active', 'unsubscribed'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `newsletter_subscribers` table
    - Add policies for authenticated users to manage subscribers
    - Add policies for anonymous users to insert subscribers (for signup form)
*/

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy for anonymous users to insert subscribers
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy for authenticated users to manage subscribers
CREATE POLICY "Authenticated users can read subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update subscribers"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete subscribers"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (true);