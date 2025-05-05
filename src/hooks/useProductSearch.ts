import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/Product';
import { getAllProducts, searchProducts } from '../services/productService';

/**
 * Options pour le hook useProductSearch
 */
interface UseProductSearchOptions {
  initialSearch?: string;
  maxResults?: number;
}

/**
 * Hook personnalisé pour gérer la recherche de produits
 */
export const useProductSearch = (options: UseProductSearchOptions = {}) => {
  const {
    initialSearch = '',
    maxResults = 5
  } = options;

  // États pour les produits et la recherche
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  // Charger tous les produits au montage du composant
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const productsData = await getAllProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Effectuer une recherche lorsque la requête change
  useEffect(() => {
    if (searchQuery.trim()) {
      const performSearch = async () => {
        setIsSearching(true);
        try {
          const results = await searchProducts(searchQuery);
          setSearchResults(results.slice(0, maxResults));
        } catch (error) {
          console.error('Erreur lors de la recherche de produits:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      };
      
      performSearch();
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, maxResults]);

  /**
   * Rechercher des produits par nom
   */
  const searchProductsByName = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  /**
   * Détecter les mentions de produits dans un texte
   */
  const detectProductMentions = useCallback((text: string): Product[] => {
    if (!text || !products.length) return [];
    
    const mentionRegex = /@([\w\s-]+)/g;
    const mentions: string[] = [];
    let match;
    
    // Extraire toutes les mentions de la forme @produitX
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1].trim());
    }
    
    // Trouver les produits correspondants aux mentions
    const mentionedProducts = mentions
      .map(mention => {
        // Rechercher le produit par nom (insensible à la casse)
        return products.find(product => 
          product.name.toLowerCase().includes(mention.toLowerCase()) ||
          mention.toLowerCase().includes(product.name.toLowerCase())
        );
      })
      .filter((product): product is Product => product !== undefined);
    
    return mentionedProducts;
  }, [products]);

  /**
   * Détecter si l'utilisateur demande une comparaison de produits
   */
  const detectComparisonRequest = useCallback((text: string): { isComparison: boolean, productNames: string[], productsToCompare: Product[] } => {
    // Expressions régulières pour détecter les demandes de comparaison
    const comparisonRegex = /compar(e[rz]?|aison|atif)|versus|vs\.?|différence entre|quel(?:le)? est (?:la|le) meilleur(?:e)?/i;
    
    // Vérifier si le texte contient une demande de comparaison
    const isComparison = comparisonRegex.test(text);
    
    if (!isComparison) {
      return { isComparison: false, productNames: [], productsToCompare: [] };
    }
    
    // Extraire les noms de produits mentionnés
    // 1. Chercher les mentions explicites avec @
    const mentionedProducts = detectProductMentions(text);
    const mentionedNames = mentionedProducts.map(p => p.name);
    
    // 2. Si moins de 2 produits sont mentionnés avec @, chercher des noms de produits dans le texte
    if (mentionedNames.length < 2) {
      // Chercher tous les produits dont le nom apparaît dans le texte
      const textLower = text.toLowerCase();
      const potentialProducts = products.filter(product => 
        textLower.includes(product.name.toLowerCase())
      );
      
      // Ajouter les produits trouvés qui ne sont pas déjà dans la liste
      potentialProducts.forEach(product => {
        if (!mentionedNames.includes(product.name)) {
          mentionedNames.push(product.name);
        }
      });
    }
    
    // Trouver les produits complets à partir des noms
    const productsToCompare = mentionedNames
      .map(name => products.find(p => p.name.toLowerCase() === name.toLowerCase()))
      .filter((p): p is Product => p !== undefined);
    
    return { 
      isComparison, 
      productNames: mentionedNames,
      productsToCompare
    };
  }, [products, detectProductMentions]);

  return {
    products,
    isLoading,
    isSearching,
    searchQuery,
    searchResults,
    searchProductsByName,
    detectProductMentions,
    detectComparisonRequest
  };
};