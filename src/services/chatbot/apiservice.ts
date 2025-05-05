/**
 * Service de gestion des requêtes API pour le chatbot
 * Gère les appels à l'API Google Gemini avec gestion des erreurs et retry automatique
 */

import { Product } from '../../types/Product';
import { generateSystemPrompt, getGeminiRequestConfig, prepareProductContext } from '../../config/chatbotConfig';

/**
 * Interface pour la réponse du chatbot
 */
export interface ChatbotResponse {
  response?: string;
  error?: string;
  source?: 'google' | 'fallback' | 'cache';
}

/**
 * Fonction pour effectuer une requête API Google Gemini avec retry automatique
 * @param requestBody Le corps de la requête à envoyer à l'API
 * @param apiKey La clé API Google Gemini
 * @param retryCount Le nombre de tentatives déjà effectuées (pour usage interne)
 * @param maxRetries Le nombre maximum de tentatives avant d'abandonner
 * @returns Les données de réponse de l'API
 * @throws Error si la requête échoue après toutes les tentatives
 */
export async function makeGoogleApiRequest(requestBody: any, apiKey: string, retryCount = 0, maxRetries = 3): Promise<any> {
  try {
    // Effectuer la requête à l'API Google Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    // Gérer les réponses non-OK (codes d'erreur HTTP)
    if (!response.ok) {
      let errorData;
      try {
        // Tenter de parser le message d'erreur JSON
        const errorText = await response.text();
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        // Si le parsing échoue, créer un objet d'erreur générique
        errorData = { error: { message: `Erreur ${response.status}: ${response.statusText}. Réponse non JSON.` } };
      }
      
      // Si on a atteint le nombre maximum de tentatives, lancer une erreur
      if (retryCount >= maxRetries) {
        throw new Error(`Erreur API Google (${response.status}): ${errorData?.error?.message || response.statusText || 'Erreur inconnue'}`);
      }
      
      // Attendre avant de réessayer (backoff exponentiel)
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`Tentative Google API ${retryCount + 1}/${maxRetries} échouée. Nouvelle tentative dans ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Réessayer avec incrémentation du compteur de tentatives
      return makeGoogleApiRequest(requestBody, apiKey, retryCount + 1, maxRetries);
    }

    // Traiter la réponse réussie
    const data = await response.json();
    return data;
  } catch (error) {
    // Gérer les erreurs de réseau ou autres erreurs non-HTTP
    if (retryCount < maxRetries) {
      // Calculer le temps d'attente avec backoff exponentiel (1s, 2s, 4s, 8s...)
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`Erreur lors de la tentative Google API ${retryCount + 1}/${maxRetries}. Nouvelle tentative dans ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Réessayer avec incrémentation du compteur de tentatives
      return makeGoogleApiRequest(requestBody, apiKey, retryCount + 1, maxRetries);
    }
    // Si toutes les tentatives ont échoué, propager l'erreur
    throw error;
  }
}

/**
 * Génère une réponse en utilisant l'API Google Gemini
 * @param question La question posée par l'utilisateur
 * @param products La liste des produits disponibles
 * @param messageHistory L'historique des messages optimisé
 * @param thinkingBudget Budget de tokens pour la génération
 * @param searchAnchor Contexte d'ancrage pour orienter la recherche
 * @returns La réponse du chatbot avec sa source
 */
export async function generateGoogleResponse(
  question: string, 
  products: Product[], 
  messageHistory: { text: string, sender: 'user' | 'bot' }[] = [], 
  thinkingBudget?: number, 
  searchAnchor?: string
): Promise<ChatbotResponse> {
  try {
    // Vérifier la disponibilité de la clé API
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return { error: "Erreur de configuration: Clé API Google Gemini manquante (VITE_GOOGLE_GEMINI_API_KEY).", source: 'google' };
    }

    // Limiter le nombre de produits pour éviter de dépasser la limite de tokens
    const limitedProducts = products.slice(0, 250);
    const productContext = prepareProductContext(limitedProducts);

    // Générer le prompt système avec le contexte des produits
    const systemPrompt = generateSystemPrompt(productContext);
    
    // Logs pour débogage
    console.log('Utilisation de l\'historique optimisé pour la requête API');
    console.log(`Requête API avec ${messageHistory.length} messages dans l'historique`);
    
    // Configuration de la requête pour Google Gemini
    const requestBody = getGeminiRequestConfig(systemPrompt, question, messageHistory, thinkingBudget, searchAnchor);
    
    // Effectuer la requête API avec gestion des erreurs
    try {
      const data = await makeGoogleApiRequest(requestBody, apiKey);
      const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!generatedContent) {
        throw new Error("La réponse de l'API Google est vide ou mal structurée.");
      }

      return { response: generatedContent, source: 'google' };
    } catch (error: any) {
      console.error('Erreur lors de la génération de la réponse Google Gemini:', error);
      throw error; // Propager l'erreur pour être gérée par le bloc catch principal
    }
  } catch (error: any) {
    console.error('Erreur lors de la génération de la réponse Google Gemini:', error);
    return { 
      error: `Erreur avec l'API Google Gemini: ${error.message || 'Erreur inconnue'}`,
      source: 'google'
    };
  }
}