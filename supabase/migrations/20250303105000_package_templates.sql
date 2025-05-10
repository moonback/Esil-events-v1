/*
  # Create package templates tables

  1. New Tables
    - `package_templates`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `slug` (text, not null, unique)
      - `target_event_type` (text)
      - `base_price` (numeric)
      - `is_active` (boolean, not null)
      - `image_url` (text)
      - `order_index` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `package_template_items`
      - `id` (uuid, primary key)
      - `package_template_id` (uuid, foreign key to package_templates.id)
      - `item_id` (uuid)
      - `item_type` (text, not null)
      - `default_quantity` (integer, not null)
      - `is_optional` (boolean, not null)
      - `is_quantity_adjustable` (boolean, not null)
      - `min_quantity` (integer)
      - `max_quantity` (integer)
      - `discount_percentage` (numeric)
      - `unit_override` (text)
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage templates
    - Add policies for anonymous users to read active templates
*/

-- Create package_templates table
CREATE TABLE IF NOT EXISTS package_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  slug text NOT NULL UNIQUE,
  target_event_type text,
  base_price numeric,
  is_active boolean NOT NULL DEFAULT true,
  image_url text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create package_template_items table
CREATE TABLE IF NOT EXISTS package_template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_template_id uuid NOT NULL REFERENCES package_templates(id) ON DELETE CASCADE,
  item_id uuid NOT NULL,
  item_type text NOT NULL,
  default_quantity integer NOT NULL DEFAULT 1,
  is_optional boolean NOT NULL DEFAULT false,
  is_quantity_adjustable boolean NOT NULL DEFAULT true,
  min_quantity integer,
  max_quantity integer,
  discount_percentage numeric,
  unit_override text
);

-- Enable Row Level Security
ALTER TABLE package_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_template_items ENABLE ROW LEVEL SECURITY;

-- Policies for package_templates

-- Policy for anonymous users to read active templates
CREATE POLICY "Anyone can read active package templates"
  ON package_templates
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Policies for authenticated users to manage templates
CREATE POLICY "Authenticated users can insert package templates"
  ON package_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update package templates"
  ON package_templates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete package templates"
  ON package_templates
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for package_template_items

-- Policy for anonymous users to read template items
CREATE POLICY "Anyone can read package template items"
  ON package_template_items
  FOR SELECT
  TO anon
  USING (true);

-- Policies for authenticated users to manage template items
CREATE POLICY "Authenticated users can insert package template items"
  ON package_template_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update package template items"
  ON package_template_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete package template items"
  ON package_template_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_package_template_items_template_id ON package_template_items(package_template_id);
CREATE INDEX idx_package_template_items_item ON package_template_items(item_id, item_type);