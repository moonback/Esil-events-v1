/*
  # Extension de la table quote_requests

  Cette migration étend la table quote_requests existante pour inclure tous les champs
  du formulaire de demande de devis.

  Modifications:
  - Ajout de nouveaux champs pour les informations de facturation
  - Ajout de champs pour les détails de l'événement
  - Ajout de champs pour les informations de livraison et reprise
  - Ajout de champs pour les commentaires et conditions
*/

-- Vérifier si la table existe déjà
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quote_requests') THEN
    -- Ajouter les nouveaux champs à la table existante
    
    -- Informations de facturation supplémentaires
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS customer_type text NOT NULL DEFAULT 'particular';
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS billing_address text;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS postal_code text;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS city text;
    
    -- Détails de l'événement
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS event_start_time text;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS event_end_time text;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS guest_count integer;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS event_location text;
    
    -- Informations de livraison
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS delivery_type text;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS pickup_date text;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS delivery_date text;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS delivery_time_slot text;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS delivery_address text;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS delivery_postal_code text;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS delivery_city text;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS exterior_access text;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS interior_access text;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS elevator_width numeric;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS elevator_height numeric;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS elevator_depth numeric;
    
    -- Informations de reprise
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS pickup_return_date text;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS pickup_return_start_time text;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS pickup_return_end_time text;
    
    -- Commentaires et conditions
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS comments text;
    ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT true;
  ELSE
    -- Créer la table complète si elle n'existe pas
    CREATE TABLE quote_requests (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name text NOT NULL,
      last_name text NOT NULL,
      company text,
      email text NOT NULL,
      phone text NOT NULL,
      customer_type text NOT NULL DEFAULT 'particular',
      billing_address text,
      postal_code text,
      city text,
      
      description text,
      event_date date NOT NULL,
      event_duration text NOT NULL,
      event_start_time text,
      event_end_time text,
      guest_count integer,
      event_location text,
      
      delivery_type text,
      pickup_date text,
      delivery_date text,
      delivery_time_slot text,
      delivery_address text,
      delivery_postal_code text,
      delivery_city text,
      exterior_access text,
      interior_access text,
      elevator_width numeric,
      elevator_height numeric,
      elevator_depth numeric,
      
      pickup_return_date text,
      pickup_return_start_time text,
      pickup_return_end_time text,
      
      comments text,
      terms_accepted boolean DEFAULT true,
      
      items jsonb NOT NULL,
      status text NOT NULL DEFAULT 'pending',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    -- Activer RLS sur la table
    ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
    
    -- Politique pour les utilisateurs anonymes pour insérer des demandes de devis
    CREATE POLICY "Anyone can insert quote requests"
      ON quote_requests
      FOR INSERT
      TO anon
      WITH CHECK (true);
      
    -- Politique pour les utilisateurs authentifiés pour gérer les demandes de devis
    CREATE POLICY "Authenticated users can view all quote requests"
      ON quote_requests
      FOR SELECT
      TO authenticated
      USING (true);
      
    CREATE POLICY "Authenticated users can update quote requests"
      ON quote_requests
      FOR UPDATE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Créer un trigger pour mettre à jour le champ updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger s'il n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_quote_requests_updated_at'
  ) THEN
    CREATE TRIGGER set_quote_requests_updated_at
    BEFORE UPDATE ON quote_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;