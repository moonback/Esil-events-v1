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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
 * Génère des suggestions de questions intelligentes basées sur les produits disponibles et l'historique des conversations
 */
export const generateDynamicSuggestions = (products: Product[], messageHistory: {text: string, sender: 'user' | 'bot'}[] = []): string[] => {
  // Suggestions par défaut organisées par catégorie
  const defaultSuggestions = {
    general: [
      "Quels sont vos produits les plus populaires pour un événement professionnel ?",
      "Quels équipements recommandez-vous pour un mariage en extérieur ?",
      "Comment fonctionne votre service de livraison et installation ?",
      "Proposez-vous des forfaits spéciaux pour les événements de grande envergure ?"
    ],
    pricing: [
      "Quels sont vos tarifs pour une location sur un week-end complet ?",
      "Proposez-vous des réductions pour les locations de longue durée ?",
      "Y a-t-il des frais supplémentaires pour la livraison et l'installation ?",
      "Comment fonctionne le système de caution pour vos équipements ?"
    ],
    logistics: [
      "Quel est votre délai de réservation minimum pour un événement ?",
      "Comment se déroule la livraison et la récupération du matériel ?",
      "Proposez-vous un service d'assistance technique pendant l'événement ?",
      "Que se passe-t-il en cas de problème avec l'équipement pendant l'événement ?"
    ],
    specific: [
      "Avez-vous des systèmes de sonorisation adaptés pour des conférences ?",
      "Quels types d'éclairages proposez-vous pour une ambiance festive ?",
      "Disposez-vous de mobilier pour des événements en extérieur ?",
      "Proposez-vous des solutions vidéo pour des projections en plein air ?"
    ],
    comparison: [
      "Pouvez-vous comparer les différents systèmes de sonorisation que vous proposez ?",
      "Quelle est la différence entre vos modèles d'éclairage LED et traditionnels ?",
      "Comparez les options de mobilier pour intérieur et extérieur",
      "Quelles sont les différences entre vos vidéoprojecteurs standard et haut de gamme ?"
    ]
  };

  // Si pas de produits, retourner un mix de suggestions par défaut
  if (!products || products.length === 0) {
    return [
      ...defaultSuggestions.general.slice(0, 1),
      ...defaultSuggestions.pricing.slice(0, 1),
      ...defaultSuggestions.logistics.slice(0, 1),
      ...defaultSuggestions.specific.slice(0, 1)
    ];
  }

  // Extraire les catégories uniques des produits avec comptage de fréquence
  const categoryFrequency: Record<string, number> = {};
  products.forEach(product => {
    if (typeof product.category === 'string' && product.category.trim()) {
      categoryFrequency[product.category] = (categoryFrequency[product.category] || 0) + 1;
    } else if (Array.isArray(product.category)) {
      product.category.forEach(cat => {
        if (cat && cat.trim()) {
          categoryFrequency[cat] = (categoryFrequency[cat] || 0) + 1;
        }
      });
    }
  });

  // Trier les catégories par fréquence et prendre les plus populaires
  const topCategories = Object.entries(categoryFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);

  // Générer des suggestions basées sur les catégories les plus populaires
  const categorySuggestions = topCategories.map(category => {
    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    return `Quels produits proposez-vous dans la catégorie ${formattedCategory} ?`;
  });

  // Analyser l'historique des messages pour des suggestions contextuelles
  let contextualSuggestions: string[] = [];
  let conversationContext: 'pricing' | 'logistics' | 'specific' | 'general' | 'comparison' = 'general';
  
  if (messageHistory.length > 0) {
    // Extraire les derniers messages pour analyse contextuelle
    const recentMessages = messageHistory.slice(-5);
    const lastUserMessage = [...recentMessages].reverse().find(msg => msg.sender === 'user');
    const lastBotMessage = [...recentMessages].reverse().find(msg => msg.sender === 'bot');
    
    // Détecter le contexte de la conversation
    const pricingKeywords = ['prix', 'tarif', 'coût', 'budget', '€', 'euro', 'euros', 'réduction', 'promotion'];
    const logisticsKeywords = ['livraison', 'transport', 'installation', 'délai', 'disponibilité', 'réservation', 'date'];
    const specificProductKeywords = ['modèle', 'référence', 'caractéristique', 'technique', 'puissance', 'dimension'];
    const comparisonKeywords = ['comparer', 'comparaison', 'versus', 'vs', 'différence', 'meilleur', 'comparatif', 'tableau'];
    
    // Analyser les messages récents pour déterminer le contexte
    const allText = recentMessages.map(msg => msg.text.toLowerCase()).join(' ');
    
    if (comparisonKeywords.some(keyword => allText.includes(keyword))) {
      conversationContext = 'comparison';
    } else if (pricingKeywords.some(keyword => allText.includes(keyword))) {
      conversationContext = 'pricing';
    } else if (logisticsKeywords.some(keyword => allText.includes(keyword))) {
      conversationContext = 'logistics';
    } else if (specificProductKeywords.some(keyword => allText.includes(keyword))) {
      conversationContext = 'specific';
    }
    
    // Générer des suggestions basées sur le dernier message du bot
    if (lastBotMessage) {
      // Si le dernier message du bot mentionne un produit, suggérer des questions de suivi
      const mentionedProducts = products.filter(product => 
        lastBotMessage.text.toLowerCase().includes(product.name.toLowerCase())
      );
      
      if (mentionedProducts.length > 0) {
        const product = mentionedProducts[0];
        
        // Suggestions personnalisées basées sur le produit mentionné
        contextualSuggestions = [
          `Quel est le prix de location de ${product.name} pour un week-end complet ?`,
          `Quelles sont les spécifications techniques détaillées de ${product.name} ?`,
          `Avez-vous des accessoires complémentaires recommandés avec ${product.name} ?`
        ];
        
        // Ajouter une suggestion basée sur la catégorie du produit si disponible
        if (product.category) {
          const category = Array.isArray(product.category) ? product.category[0] : product.category;
          if (category) {
            contextualSuggestions.push(`Quels autres produits de la catégorie ${category} pourriez-vous me recommander ?`);
          }
        }
        
        // Si plusieurs produits sont mentionnés, suggérer une comparaison
        if (mentionedProducts.length > 1) {
          const product2 = mentionedProducts[1];
          contextualSuggestions.push(`Pouvez-vous comparer ${product.name} et ${product2.name} ?`);
        }
      }
      
      // Suggestions basées sur des mots-clés spécifiques dans la conversation
      if (lastBotMessage.text.toLowerCase().includes('disponible') || lastBotMessage.text.toLowerCase().includes('stock')) {
        contextualSuggestions.push("Quel est votre délai de réservation minimum pour garantir la disponibilité ?");
      }
      
      if (lastBotMessage.text.toLowerCase().includes('événement') || lastBotMessage.text.toLowerCase().includes('occasion')) {
        contextualSuggestions.push("Proposez-vous des services de conseil pour optimiser le choix d'équipements selon le type d'événement ?");
      }
    }
    
    // Si l'utilisateur a posé une question sur un sujet spécifique, proposer des questions de suivi
    if (lastUserMessage) {
      const userText = lastUserMessage.text.toLowerCase();
      
      if (userText.includes('mariage')) {
        contextualSuggestions.push("Quels packages recommandez-vous spécifiquement pour un mariage ?");
      } else if (userText.includes('conférence') || userText.includes('séminaire')) {
        contextualSuggestions.push("Quels équipements audio-visuels sont essentiels pour une conférence professionnelle ?");
      } else if (userText.includes('festival') || userText.includes('concert')) {
        contextualSuggestions.push("Quels systèmes de sonorisation recommandez-vous pour un événement musical en extérieur ?");
      }
    }
  }

  // Sélectionner des suggestions par défaut basées sur le contexte détecté
  const contextBasedDefaultSuggestions = defaultSuggestions[conversationContext].slice(0, 2);

  // Générer des suggestions basées sur les produits populaires (limité à 2)
  const productSuggestions = products
    .slice(0, 5)
    .map(product => `Pouvez-vous me donner plus d'informations sur ${product.name} et ses applications ?`)
    .slice(0, 2);

  // Combiner et filtrer les suggestions pour éviter les doublons
  // Priorité: suggestions contextuelles > catégories > produits > suggestions par défaut
  const allSuggestions = [
    ...contextualSuggestions,
    ...categorySuggestions,
    ...productSuggestions,
    ...contextBasedDefaultSuggestions
  ];
  
  // Éliminer les doublons et les suggestions trop similaires
  const uniqueSuggestions: string[] = [];
  const lowercaseSuggestions = new Set<string>();
  
  for (const suggestion of allSuggestions) {
    const normalized = suggestion.toLowerCase();
    // Vérifier si une suggestion similaire existe déjà
    const isDuplicate = Array.from(lowercaseSuggestions).some(existing => 
      normalized.includes(existing) || existing.includes(normalized)
    );
    
    if (!isDuplicate) {
      uniqueSuggestions.push(suggestion);
      lowercaseSuggestions.add(normalized);
      
      // Limiter à 4 suggestions
      if (uniqueSuggestions.length >= 4) break;
    }
  }
  
  return uniqueSuggestions;
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
