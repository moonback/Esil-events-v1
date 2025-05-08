/*
  # Create saved_keywords table

  1. New Tables
    - `saved_keywords`
      - `id` (uuid, primary key)
      - `keyword` (text, not null)
      - `relevance` (integer, not null)
      - `difficulty` (integer, nullable)
      - `searchVolume` (text, nullable)
      - `competition` (text, nullable)
      - `type` (text, not null)
      - `topic` (text, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `saved_keywords` table
    - Add policies for authenticated users to manage saved keywords
*/

CREATE TABLE IF NOT EXISTS saved_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  relevance integer NOT NULL DEFAULT 0,
  difficulty integer,
  "searchVolume" text,
  competition text,
  type text NOT NULL,
  topic text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_saved_keywords_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_saved_keywords_updated_at
BEFORE UPDATE ON saved_keywords
FOR EACH ROW
EXECUTE FUNCTION update_saved_keywords_modified_column();

-- Enable Row Level Security
ALTER TABLE saved_keywords ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to manage saved keywords
CREATE POLICY "Authenticated users can manage saved keywords"
  ON saved_keywords
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy for anonymous users to read saved keywords
CREATE POLICY "Anonymous users can read saved keywords"
  ON saved_keywords
  FOR SELECT
  TO anon
  USING (true);