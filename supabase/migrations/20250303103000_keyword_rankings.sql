/*
  # Create keyword_rankings table

  1. New Tables
    - `keyword_rankings`
      - `id` (uuid, primary key)
      - `keyword` (text, not null)
      - `position` (integer, not null)
      - `previousPosition` (integer, nullable)
      - `lastChecked` (date, not null)
      - `url` (text, not null)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `keyword_rankings` table
    - Add policies for authenticated users to manage keyword rankings
    - Add policies for anonymous users to read keyword rankings
*/

CREATE TABLE IF NOT EXISTS keyword_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  "previousPosition" integer,
  "lastChecked" date NOT NULL DEFAULT CURRENT_DATE,
  url text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_keyword_rankings_updated_at
BEFORE UPDATE ON keyword_rankings
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security
ALTER TABLE keyword_rankings ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to manage keyword rankings
CREATE POLICY "Authenticated users can manage keyword rankings"
  ON keyword_rankings
  FOR ALL
  TO authenticated
  USING (true);

-- Policy for anonymous users to read keyword rankings
CREATE POLICY "Anonymous users can read keyword rankings"
  ON keyword_rankings
  FOR SELECT
  TO anon
  USING (true);

-- Index for faster searches
CREATE INDEX idx_keyword_rankings_keyword ON keyword_rankings (keyword);
CREATE INDEX idx_keyword_rankings_url ON keyword_rankings (url);