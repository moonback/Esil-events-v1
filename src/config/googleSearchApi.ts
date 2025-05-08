/**
 * Configuration pour l'API SerpApi
 */

export const SERP_API_CONFIG = {
  // Votre clé API SerpApi (à remplacer par votre propre clé)
  API_KEY: import.meta.env.VITE_SERP_API_KEY || '',
  
  // URL de base de l'API
  BASE_URL: 'https://serpapi.com/search',
  
  // Nombre maximum de résultats à récupérer
  MAX_RESULTS: 100,
  
  // Délai entre les requêtes pour éviter de dépasser les limites de l'API (en ms)
  THROTTLE_DELAY: 2000,
  
  // Paramètres par défaut pour les recherches
  DEFAULT_PARAMS: {
    engine: 'google',      // Moteur de recherche à utiliser
    google_domain: 'google.fr', // Domaine Google à utiliser
    gl: 'fr',              // Pays de recherche
    hl: 'fr'               // Langue de recherche
  }
};

/**
 * Vérifie si la configuration de l'API SerpApi est valide
 */
export const isGoogleSearchConfigValid = (): boolean => {
  return !!SERP_API_CONFIG.API_KEY;
};