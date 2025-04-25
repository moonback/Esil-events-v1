/*
  # Add main_image_index column to products table

  Cette migration ajoute la colonne main_image_index à la table products
  pour permettre de spécifier quelle image du tableau images est l'image principale.

  Modifications:
  - Ajout de la colonne main_image_index (integer) à la table products
*/

-- Vérifier si la table existe déjà
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    -- Ajouter la colonne main_image_index si elle n'existe pas déjà
    ALTER TABLE products ADD COLUMN IF NOT EXISTS main_image_index integer;
    
    -- Ajouter la colonne sub_sub_category si elle n'existe pas déjà
    ALTER TABLE products ADD COLUMN IF NOT EXISTS sub_sub_category text;
    
    -- Ajouter les colonnes created_by et updated_by si elles n'existent pas déjà
    ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id);
    
    -- Ajouter la colonne stock si elle n'existe pas déjà
    ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;
    
    -- Ajouter la colonne is_available si elle n'existe pas déjà
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;
    
    -- Ajouter la colonne sub_category si elle n'existe pas déjà
    ALTER TABLE products ADD COLUMN IF NOT EXISTS sub_category text;
  END IF;
END $$;