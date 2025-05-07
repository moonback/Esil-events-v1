import { supabase } from './supabaseClient';
import { Product } from '../types/Product';
import { getAllProducts, getProductsByCategory, searchProducts } from './productService';

/**
 * Service pour fournir des informations sur les produits au chatbot
 */

// Interface pour les résultats de recherche de produits
export interface ProductSearchResult {
  products: Product[];
  totalCount: number;
  query: string;
}

/**
 * Récupère tous les produits pour le chatbot
 * @returns Liste des produits avec informations essentielles
 */
export const getProductsForChatbot = async (): Promise<Product[]> => {
  try {
    const products = await getAllProducts();
    return products;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des produits pour le chatbot:', error.message);
    return [];
  }
};

/**
 * Récupère les produits par catégorie pour le chatbot
 * @param category Catégorie des produits à récupérer
 * @returns Liste des produits de la catégorie spécifiée
 */
export const getProductsByCategoryForChatbot = async (category: string): Promise<Product[]> => {
  try {
    const products = await getProductsByCategory(category);
    return products;
  } catch (error: any) {
    console.error(`Erreur lors de la récupération des produits de la catégorie ${category}:`, error.message);
    return [];
  }
};

/**
 * Recherche des produits pour le chatbot
 * @param query Terme de recherche
 * @returns Résultats de la recherche
 */
export const searchProductsForChatbot = async (query: string): Promise<ProductSearchResult> => {
  try {
    const products = await searchProducts(query);
    return {
      products,
      totalCount: products.length,
      query
    };
  } catch (error: any) {
    console.error(`Erreur lors de la recherche de produits avec le terme "${query}":`, error.message);
    return {
      products: [],
      totalCount: 0,
      query
    };
  }
};

/**
 * Récupère les catégories de produits disponibles
 * @returns Liste des catégories de produits
 */
export const getProductCategoriesForChatbot = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .order('category');

    if (error) throw error;

    // Extraire les catégories uniques
    const categories = new Set<string>();
    data.forEach(item => {
      if (Array.isArray(item.category)) {
        item.category.forEach(cat => categories.add(cat));
      } else if (item.category) {
        categories.add(item.category);
      }
    });

    return Array.from(categories);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des catégories de produits:', error.message);
    return [];
  }
};

/**
 * Récupère les informations détaillées d'un produit par son ID
 * @param productId ID du produit
 * @returns Détails du produit
 */
export const getProductDetailsForChatbot = async (productId: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Convertir les données au format Product
    return {
      id: data.id,
      name: data.name,
      reference: data.reference,
      category: data.category,
      subCategory: data.sub_category,
      subSubCategory: data.sub_sub_category || '',
      description: data.description,
      priceHT: parseFloat(data.price_ht),
      priceTTC: parseFloat(data.price_ttc),
      stock: data.stock,
      isAvailable: data.is_available,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      images: data.images || [],
      mainImageIndex: data.main_image_index,
      slug: data.slug || null,
      colors: data.colors || [],
      relatedProducts: data.related_products || [],
      technicalSpecs: data.technical_specs || {},
      technicalDocUrl: data.technical_doc_url || null,
      videoUrl: data.video_url || null,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      seo_keywords: data.seo_keywords || null
    };
  } catch (error: any) {
    console.error(`Erreur lors de la récupération des détails du produit ${productId}:`, error.message);
    return null;
  }
};