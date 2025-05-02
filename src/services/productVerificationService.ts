import { supabase } from './supabaseClient';

/**
 * Vérifie si un produit existe dans la base de données
 * @param id L'identifiant du produit à vérifier
 * @returns true si le produit existe, false sinon
 */
export const checkProductExists = async (id: string): Promise<boolean> => {
  try {
    console.log('Vérification de l\'existence du produit:', id);
    
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Erreur lors de la vérification du produit:', error);
      throw new Error(`Échec de la vérification du produit: ${error.message}`);
    }

    // Si data est null, le produit n'existe pas
    const exists = data !== null;
    console.log(`Produit ${id} existe: ${exists}`);
    
    return exists;
  } catch (error) {
    console.error('Erreur dans checkProductExists:', error);
    throw error;
  }
};