/*
  # Add description and SEO fields to categories table

  1. New Fields
    - `description` (text, nullable) - Description of the category
    - `seo_title` (text, nullable) - SEO title for the category
    - `seo_description` (text, nullable) - SEO description for the category
    - `seo_keywords` (text, nullable) - SEO keywords for the category
*/

-- Add description and SEO fields to categories table
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_keywords text;

-- Add description and SEO fields to subcategories table
ALTER TABLE subcategories
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_keywords text;

-- Add description and SEO fields to subsubcategories table
ALTER TABLE subsubcategories
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_keywords text;