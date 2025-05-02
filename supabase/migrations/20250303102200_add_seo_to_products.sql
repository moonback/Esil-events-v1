/*
  # Add SEO fields to products table

  Cette migration ajoute des champs SEO à la table products pour améliorer le référencement des produits.

  Modifications:
  - Ajout de la colonne seo_title (text) - Titre SEO pour le produit
  - Ajout de la colonne seo_description (text) - Description SEO pour le produit
  - Ajout de la colonne seo_keywords (text) - Mots-clés SEO pour le produit
*/

-- Vérifier si la table existe déjà
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    -- Ajouter les colonnes SEO si elles n'existent pas déjà
    ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title text;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description text;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_keywords text;
  END IF;
END $$;