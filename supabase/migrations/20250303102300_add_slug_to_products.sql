/*
  # Add slug field to products table

  Cette migration ajoute un champ slug à la table products pour améliorer les URLs des produits.

  Modifications:
  - Ajout de la colonne slug (text) - Slug unique pour le produit
  - Ajout d'un index unique sur la colonne slug
*/

-- Vérifier si la table existe déjà
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    -- Ajouter la colonne slug si elle n'existe pas déjà
    ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;
    
    -- Créer un index unique sur la colonne slug
    -- Nous utilisons CREATE INDEX IF NOT EXISTS pour éviter les erreurs si l'index existe déjà
    CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products (slug);
    
    -- Ajouter une contrainte pour s'assurer que le slug est unique lorsqu'il n'est pas null
    DO $inner$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'products_slug_unique'
      ) THEN
        ALTER TABLE products ADD CONSTRAINT products_slug_unique UNIQUE (slug);
      END IF;
    END $inner$;
  END IF;
END $$;