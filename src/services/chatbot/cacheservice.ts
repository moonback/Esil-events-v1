/**
 * Service de gestion du cache pour le chatbot
 * Permet de stocker et récupérer des réponses en cache pour optimiser les performances
 */

/**
 * Interface pour les entrées du cache de réponses
 */
export interface CachedResponse {
  question: string;
  response: string;
  timestamp: number; // Date de mise en cache (timestamp)
  expiresAt: number; // Date d'expiration (timestamp)
}

// Clé de stockage pour le cache dans localStorage
const CACHE_STORAGE_KEY = 'chatbot_response_cache';

// Durée de validité du cache en millisecondes (7 jours par défaut)
export const CACHE_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000;

/**
 * Récupère les réponses en cache depuis le localStorage
 */
export const getCachedResponses = (): CachedResponse[] => {
  try {
    const data = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Erreur lors de la lecture du cache de réponses:', error);
    return [];
  }
};

/**
 * Sauvegarde les réponses en cache dans le localStorage
 */
export const saveCachedResponses = (responses: CachedResponse[]): void => {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(responses));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du cache de réponses:', error);
  }
};

/**
 * Ajoute une réponse au cache
 * @param question La question posée par l'utilisateur
 * @param response La réponse générée
 */
export const addResponseToCache = (question: string, response: string): void => {
  try {
    // Normaliser la question (minuscules, sans espaces superflus)
    const normalizedQuestion = question.toLowerCase().trim();
    
    // Récupérer le cache actuel
    const cachedResponses = getCachedResponses();
    
    // Vérifier si la question existe déjà dans le cache
    const existingIndex = cachedResponses.findIndex(
      entry => entry.question.toLowerCase().trim() === normalizedQuestion
    );
    
    const now = Date.now();
    const newEntry: CachedResponse = {
      question: normalizedQuestion,
      response,
      timestamp: now,
      expiresAt: now + CACHE_EXPIRY_TIME
    };
    
    // Mettre à jour ou ajouter l'entrée
    if (existingIndex >= 0) {
      cachedResponses[existingIndex] = newEntry;
    } else {
      cachedResponses.push(newEntry);
    }
    
    // Sauvegarder le cache mis à jour
    saveCachedResponses(cachedResponses);
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'une réponse au cache:', error);
  }
};

/**
 * Récupère une réponse du cache si elle existe et n'est pas expirée
 * @param question La question posée par l'utilisateur
 * @returns La réponse en cache ou null si aucune correspondance
 */
export const getResponseFromCache = (question: string): string | null => {
  try {
    // Normaliser la question
    const normalizedQuestion = question.toLowerCase().trim();
    
    // Récupérer le cache
    const cachedResponses = getCachedResponses();
    
    // Filtrer les réponses expirées
    const now = Date.now();
    const validResponses = cachedResponses.filter(entry => entry.expiresAt > now);
    
    // Si des réponses ont expiré, mettre à jour le cache
    if (validResponses.length < cachedResponses.length) {
      saveCachedResponses(validResponses);
    }
    
    // Chercher une correspondance exacte
    const exactMatch = validResponses.find(
      entry => entry.question === normalizedQuestion
    );
    
    if (exactMatch) {
      return exactMatch.response;
    }
    
    // Chercher une correspondance approximative (la question contient des mots-clés similaires)
    const questionWords = new Set(normalizedQuestion.split(/\s+/).filter(word => word.length > 3));
    
    if (questionWords.size > 0) {
      // Créer une Map pour stocker la fréquence des mots pour une recherche plus rapide
      const wordFrequencyMap = new Map<string, number>();
      validResponses.forEach(entry => {
        entry.question.split(/\s+/)
          .filter(word => word.length > 3)
          .forEach(word => {
            wordFrequencyMap.set(word, (wordFrequencyMap.get(word) || 0) + 1);
          });
      });

      // Calculer les scores de similarité en une seule passe
      const similarityScores = validResponses.map(entry => {
        const entryWords = new Set(entry.question.split(/\s+/).filter(word => word.length > 3));
        const commonWords = Array.from(questionWords).filter(word => entryWords.has(word));
        return {
          entry,
          score: commonWords.length / questionWords.size
        };
      });

      // Filtrer et trier en une seule opération
      const bestMatch = similarityScores
        .filter(({score}) => score >= 0.7)
        .sort((a, b) => b.entry.timestamp - a.entry.timestamp)[0];

      if (bestMatch) {
        return bestMatch.entry.response;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération d\'une réponse du cache:', error);
    return null;
  }
};

/**
 * Vide le cache de réponses
 */
export const clearResponseCache = (): void => {
  try {
    localStorage.removeItem(CACHE_STORAGE_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression du cache de réponses:', error);
  }
};