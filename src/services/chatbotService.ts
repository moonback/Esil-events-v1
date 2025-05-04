import { Product } from '../types/Product';
import { generateSystemPrompt, getGeminiRequestConfig, prepareProductContext } from '../config/chatbotConfig';

/**
 * Service pour gérer les interactions du chatbot avec l'API Google Gemini
 */

interface ChatbotResponse {
  response?: string;
  error?: string;
  source?: 'google' | 'fallback' | 'cache';
}

/**
 * Interface pour les entrées du cache de réponses
 */
interface CachedResponse {
  question: string;
  response: string;
  timestamp: number; // Date de mise en cache (timestamp)
  expiresAt: number; // Date d'expiration (timestamp)
}

/**
 * Type d'API à utiliser pour le chatbot
 */
export type ChatbotApiType = 'google';

// Clé de stockage pour le cache dans localStorage
const CACHE_STORAGE_KEY = 'chatbot_response_cache';

// Durée de validité du cache en millisecondes (7 jours par défaut)
const CACHE_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000;

/**
 * Récupère les réponses en cache depuis le localStorage
 */
const getCachedResponses = (): CachedResponse[] => {
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
const saveCachedResponses = (responses: CachedResponse[]): void => {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(responses));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du cache de réponses:', error);
  }
};

/**
 * Ajoute une réponse au cache
 */
const addResponseToCache = (question: string, response: string): void => {
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
 */
const getResponseFromCache = (question: string): string | null => {
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
    const questionWords = normalizedQuestion.split(/\s+/).filter(word => word.length > 3);
    
    if (questionWords.length > 0) {
      // Chercher des entrées qui contiennent au moins 70% des mots importants de la question
      const similarEntries = validResponses.filter(entry => {
        const entryWords = entry.question.split(/\s+/).filter(word => word.length > 3);
        const commonWords = questionWords.filter(word => entryWords.includes(word));
        return commonWords.length >= Math.ceil(questionWords.length * 0.7);
      });
      
      if (similarEntries.length > 0) {
        // Retourner la réponse la plus récente parmi les correspondances approximatives
        return similarEntries.sort((a, b) => b.timestamp - a.timestamp)[0].response;
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


// La fonction prepareProductContext a été déplacée vers ../config/chatbotConfig.ts

/**
 * Fonction pour effectuer une requête API Google Gemini avec retry
 */
async function makeGoogleApiRequest(requestBody: any, apiKey: string, retryCount = 0, maxRetries = 3): Promise<any> {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorData;
      try {
        const errorText = await response.text();
        errorData = JSON.parse(errorText);
      } catch (parseError) {
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
      
      // Réessayer
      return makeGoogleApiRequest(requestBody, apiKey, retryCount + 1, maxRetries);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (retryCount < maxRetries) {
      // Attendre avant de réessayer
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`Erreur lors de la tentative Google API ${retryCount + 1}/${maxRetries}. Nouvelle tentative dans ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Réessayer
      return makeGoogleApiRequest(requestBody, apiKey, retryCount + 1, maxRetries);
    }
    throw error;
  }
}

/**
 * Génère une réponse du chatbot basée sur la question de l'utilisateur et les produits disponibles
 */
/**
 * Génère des suggestions de questions basées sur les produits disponibles et l'historique des conversations
 */
export const generateDynamicSuggestions = (products: Product[], messageHistory: {text: string, sender: 'user' | 'bot'}[] = []): string[] => {
  // Suggestions par défaut si aucun produit n'est disponible
  const defaultSuggestions = [
    "Quels sont vos produits les plus populaires pour un mariage ?",
    "Avez-vous des systèmes de sonorisation disponibles ?",
    "Comment fonctionne la livraison du matériel ?",
    "Quels sont vos tarifs pour la location d'éclairage ?"
  ];

  // Si pas de produits, retourner les suggestions par défaut
  if (!products || products.length === 0) {
    return defaultSuggestions;
  }

  // Extraire les catégories uniques des produits
  const categories = new Set<string>();
  products.forEach(product => {
    if (typeof product.category === 'string') {
      categories.add(product.category);
    } else if (Array.isArray(product.category)) {
      product.category.forEach(cat => categories.add(cat));
    }
  });

  // Générer des suggestions basées sur les catégories disponibles
  const categorySuggestions = Array.from(categories).slice(0, 3).map(category => 
    `Quels produits proposez-vous dans la catégorie ${category} ?`
  );

  // Générer des suggestions basées sur les produits populaires ou récents
  const productSuggestions = products
    .slice(0, 5)
    .map(product => `Pouvez-vous me donner plus d'informations sur ${product.name} ?`);

  // Analyser l'historique des messages pour des suggestions contextuelles
  let contextualSuggestions: string[] = [];
  
  if (messageHistory.length > 0) {
    // Extraire le dernier message du bot
    const lastBotMessage = messageHistory.filter(msg => msg.sender === 'bot').pop();
    
    if (lastBotMessage) {
      // Si le dernier message du bot mentionne un produit, suggérer des questions de suivi
      const mentionedProducts = products.filter(product => 
        lastBotMessage.text.toLowerCase().includes(product.name.toLowerCase())
      );
      
      if (mentionedProducts.length > 0) {
        contextualSuggestions = [
          `Quel est le prix de location de ${mentionedProducts[0].name} ?`,
          `Est-ce que ${mentionedProducts[0].name} est disponible pour ce week-end ?`,
          `Avez-vous des produits similaires à ${mentionedProducts[0].name} ?`
        ];
      }
      
      // Si le message mentionne des prix, suggérer des questions sur le budget
      if (lastBotMessage.text.includes('€') || lastBotMessage.text.toLowerCase().includes('prix') || lastBotMessage.text.toLowerCase().includes('tarif')) {
        contextualSuggestions.push("Proposez-vous des réductions pour les locations de longue durée ?");
      }
      
      // Si le message mentionne la livraison
      if (lastBotMessage.text.toLowerCase().includes('livraison') || lastBotMessage.text.toLowerCase().includes('transport')) {
        contextualSuggestions.push("Quels sont vos délais de livraison habituels ?");
      }
    }
  }

  // Combiner et filtrer les suggestions pour éviter les doublons
  const allSuggestions = [...contextualSuggestions, ...categorySuggestions, ...productSuggestions, ...defaultSuggestions];
  const uniqueSuggestions = Array.from(new Set(allSuggestions));
  
  // Retourner un maximum de 4 suggestions
  return uniqueSuggestions.slice(0, 4);
};



/**
 * Génère une réponse du chatbot en utilisant l'API Google Gemini
 */
async function generateGoogleResponse(question: string, products: Product[], thinkingBudget?: number, searchAnchor?: string): Promise<ChatbotResponse> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return { error: "Erreur de configuration: Clé API Google Gemini manquante (VITE_GOOGLE_GEMINI_API_KEY).", source: 'google' };
    }

    // Limiter le nombre de produits pour éviter de dépasser la limite de tokens
    const limitedProducts = products.slice(0, 250);
    const productContext = prepareProductContext(limitedProducts);

    // Générer le prompt système avec le contexte des produits
    const systemPrompt = generateSystemPrompt(productContext);

    // Configuration de la requête pour Google Gemini avec les nouveaux paramètres
    const requestBody = getGeminiRequestConfig(systemPrompt, question, thinkingBudget, searchAnchor);

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



/**
 * Génère une réponse du chatbot basée sur la question de l'utilisateur et les produits disponibles
 * @param question La question posée par l'utilisateur
 * @param products La liste des produits disponibles
 * @param thinkingBudget Budget de tokens pour la génération de réponse (défaut: 800)
 * @param searchAnchor Contexte d'ancrage pour orienter la recherche
 */
export const generateChatbotResponse = async (question: string, products: Product[], thinkingBudget?: number, searchAnchor?: string): Promise<ChatbotResponse> => {
  try {
    // Vérifier si une réponse existe dans le cache
    const cachedResponse = getResponseFromCache(question);
    if (cachedResponse) {
      console.log('Réponse trouvée dans le cache');
      return {
        response: cachedResponse,
        source: 'cache'
      };
    }
    
    // Si pas de réponse en cache, vérifier si la clé API est disponible
    const googleApiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (!googleApiKey) {
      return { 
        error: "Erreur de configuration: Clé API Google Gemini manquante (VITE_GOOGLE_GEMINI_API_KEY).",
        source: 'fallback'
      };
    }

    try {
      // Générer la réponse avec Google en transmettant les nouveaux paramètres
      const googleResponse = await generateGoogleResponse(question, products, thinkingBudget, searchAnchor);
      
      // Si la réponse est valide, l'ajouter au cache
      if (googleResponse.response && !googleResponse.error) {
        addResponseToCache(question, googleResponse.response);
      }
      
      return googleResponse;
    } catch (error: any) {
      throw error;
    }

  } catch (error: any) {
    console.error('Erreur lors de la génération de la réponse du chatbot:', error);
    
    // Enregistrer l'erreur pour débogage (à remplacer par Sentry ou autre service de logging)
    try {
      console.error('Détails de l\'erreur pour débogage:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    } catch (loggingError) {
      console.error('Erreur lors de la journalisation:', loggingError);
    }
    
    return { 
      error: `Désolé, une erreur s'est produite: ${error.message || 'Erreur inconnue'}. Veuillez réessayer plus tard.`,
      source: 'fallback'
    };
  }
};

function makeApiRequest(requestBody: any, apiKey: string, arg2: number, maxRetries: number): any {
  throw new Error('Function not implemented.');
}
