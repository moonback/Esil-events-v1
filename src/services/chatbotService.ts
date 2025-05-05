/**
 * Service principal du chatbot qui orchestre les différents services spécialisés
 * Ce fichier coordonne les interactions entre les services modulaires pour le chatbot
 */

import { Product } from '../types/Product';

// Import des services modulaires
import { generateGoogleResponse, ChatbotResponse } from './chatbot/apiservice';
import { addResponseToCache, getResponseFromCache, clearResponseCache } from './chatbot/cacheservice';
import { saveConversationContext, getConversationContext, optimizeMessageHistory } from './chatbot/conversationService';
import { generateDynamicSuggestions } from './chatbot/suggestionService';

/**
 * Type d'API à utiliser pour le chatbot
 */
export type ChatbotApiType = 'google';

/**
 * Exporte les fonctions des services modulaires pour une utilisation externe
 */
export { clearResponseCache, saveConversationContext, getConversationContext, generateDynamicSuggestions };

/**
 * Génère une réponse du chatbot basée sur la question de l'utilisateur et les produits disponibles
 * @param question La question posée par l'utilisateur
 * @param products La liste des produits disponibles
 * @param messageHistory L'historique complet des messages
 * @param thinkingBudget Budget de tokens pour la génération de réponse
 * @param searchAnchor Contexte d'ancrage pour orienter la recherche
 * @param enableCache Activer/désactiver l'utilisation du cache de réponses
 * @returns La réponse du chatbot avec sa source (google, cache, fallback)
 */
export const generateChatbotResponse = async (
  question: string, 
  products: Product[], 
  messageHistory: { text: string, sender: 'user' | 'bot' }[] = [], 
  thinkingBudget?: number, 
  searchAnchor?: string, 
  enableCache: boolean = true
): Promise<ChatbotResponse> => {
  try {
    // Validation des entrées
    if (!question || question.trim() === '') {
      return {
        error: "La question ne peut pas être vide.",
        source: 'fallback'
      };
    }

    // Normaliser la question (supprimer les espaces superflus)
    const normalizedQuestion = question.trim();
    
    // Sauvegarder le contexte de conversation pour une utilisation future
    saveConversationContext(messageHistory);
    
    // 1. Vérifier si une réponse existe dans le cache
    if (enableCache) {
      const cachedResponse = getResponseFromCache(normalizedQuestion);
      if (cachedResponse) {
        console.log('Réponse trouvée dans le cache');
        return {
          response: cachedResponse,
          source: 'cache'
        };
      }
    }
    
    // 2. Si pas de réponse en cache, vérifier si la clé API est disponible
    const googleApiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (!googleApiKey) {
      return { 
        error: "Erreur de configuration: Clé API Google Gemini manquante (VITE_GOOGLE_GEMINI_API_KEY).",
        source: 'fallback'
      };
    }

    // 3. Préparer et envoyer la requête à l'API Google
    try {
      // Optimiser l'historique des messages pour l'API
      const optimizedHistory = optimizeMessageHistory(messageHistory);
      console.log('Historique optimisé:', optimizedHistory.length, 'messages sur', messageHistory.length, 'originaux');
      
      // Limiter le nombre de produits pour éviter de dépasser les limites de l'API
      const limitedProducts = products.length > 250 ? products.slice(0, 250) : products;
      
      // Générer la réponse avec Google en transmettant l'historique optimisé
      const googleResponse = await generateGoogleResponse(normalizedQuestion, limitedProducts, optimizedHistory, thinkingBudget, searchAnchor);
      console.log('Réponse générée avec succès');
      
      // 4. Si la réponse est valide, l'ajouter au cache pour les futures requêtes
      if (googleResponse.response && !googleResponse.error && enableCache) {
        addResponseToCache(normalizedQuestion, googleResponse.response);
      }
      
      return googleResponse;
    } catch (error: any) {
      // Propager l'erreur pour être gérée par le bloc catch principal
      throw error;
    }

  } catch (error: any) {
    // Gestion centralisée des erreurs
    console.error('Erreur lors de la génération de la réponse du chatbot:', error);
    
    // Enregistrer l'erreur pour débogage
    try {
      console.error('Détails de l\'erreur pour débogage:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    } catch (loggingError) {
      console.error('Erreur lors de la journalisation:', loggingError);
    }
    
    // Retourner un message d'erreur convivial
    return { 
      error: `Désolé, une erreur s'est produite: ${error.message || 'Erreur inconnue'}. Veuillez réessayer plus tard.`,
      source: 'fallback'
    };
  }
};


