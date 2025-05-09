import { supabase } from './supabaseClient';

/**
 * Interface pour les suggestions de produits
 */
export interface ProductSuggestion {
  id: string;
  name: string;
  reference: string;
  imageUrl: string;
}

/**
 * Recherche des produits en fonction d'un terme de recherche
 * @param query Le terme de recherche
 * @param limit Le nombre maximum de résultats à retourner
 * @returns Une liste de suggestions de produits
 */
export const getProductSuggestions = async (query: string, limit: number = 5): Promise<ProductSuggestion[]> => {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    // Recherche insensible à la casse sur le nom et la référence
    const { data, error } = await supabase
      .from('products')
      .select('id, name, reference, images, main_image_index')
      .or(`name.ilike.%${query}%,reference.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error("Erreur lors de la recherche de suggestions de produits:", error);
      return [];
    }

    // Formater les résultats pour le frontend
    const suggestions: ProductSuggestion[] = data?.map(product => {
      // Déterminer l'URL de l'image à utiliser
      let imageUrl = '/images/default-product.svg';
      if (product.images && product.images.length > 0) {
        // Utiliser l'image principale si disponible, sinon la première image
        const imageIndex = typeof product.main_image_index === 'number' ? product.main_image_index : 0;
        imageUrl = product.images[imageIndex] || product.images[0];
      }

      return {
        id: product.id,
        name: product.name,
        reference: product.reference,
        imageUrl
      };
    }) || [];

    return suggestions;
  } catch (error) {
    console.error("Erreur lors de la recherche de suggestions de produits:", error);
    return [];
  }
};