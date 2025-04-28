/*
  # Add package support to products table

  Cette migration ajoute les colonnes nécessaires à la table products
  pour supporter les packages/kits thématiques configurables.

  Modifications:
  - Ajout de la colonne type (text) pour distinguer les produits normaux des packages
  - Ajout de la colonne package_items (jsonb) pour stocker les produits inclus dans le package
  - Ajout de la colonne package_options (jsonb) pour stocker les options de personnalisation
  - Ajout de la colonne discount_percentage (numeric) pour le pourcentage de réduction
  - Ajout des colonnes original_total_price_ht et original_total_price_ttc pour les prix originaux
*/

-- Vérifier si la table existe déjà
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    -- Ajouter la colonne type si elle n'existe pas déjà
    ALTER TABLE products ADD COLUMN IF NOT EXISTS type text DEFAULT 'product';
    
    -- Ajouter la colonne package_items si elle n'existe pas déjà
    ALTER TABLE products ADD COLUMN IF NOT EXISTS package_items jsonb DEFAULT '[]'::jsonb;
    
    -- Ajouter la colonne package_options si elle n'existe pas déjà
    ALTER TABLE products ADD COLUMN IF NOT EXISTS package_options jsonb DEFAULT '[]'::jsonb;
    
    -- Ajouter la colonne discount_percentage si elle n'existe pas déjà
    ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percentage numeric;
    
    -- Ajouter les colonnes original_total_price_ht et original_total_price_ttc
    ALTER TABLE products ADD COLUMN IF NOT EXISTS original_total_price_ht numeric;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS original_total_price_ttc numeric;
  END IF;
END $$;