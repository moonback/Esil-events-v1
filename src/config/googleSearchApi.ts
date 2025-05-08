/**
 * Configuration pour l'API Google Custom Search
 */

export const GOOGLE_SEARCH_CONFIG = {
  // Votre clé API Google (à remplacer par votre propre clé)
  API_KEY: import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || '',
  
  // ID de votre moteur de recherche personnalisé (à remplacer par votre propre ID)
  SEARCH_ENGINE_ID: import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID || '',
  
  // URL de base de l'API
  BASE_URL: 'https://www.googleapis.com/customsearch/v1',
  
  // Nombre maximum de résultats à récupérer (max 10 par requête avec l'API gratuite)
  MAX_RESULTS: 10,
  
  // Délai entre les requêtes pour éviter de dépasser les limites de l'API (en ms)
  THROTTLE_DELAY: 2000,
};

/**
 * Vérifie si la configuration de l'API Google Search est valide
 */
export const isGoogleSearchConfigValid = (): boolean => {
  return !!GOOGLE_SEARCH_CONFIG.API_KEY && !!GOOGLE_SEARCH_CONFIG.SEARCH_ENGINE_ID;
};