import { Product } from '../types/Product';

/**
 * Service pour gérer les interactions du chatbot avec l'API Google Gemini
 */

interface ChatbotResponse {
  response?: string;
  error?: string;
  source?: 'google' | 'fallback';
}

/**
 * Type d'API à utiliser pour le chatbot
 */
export type ChatbotApiType = 'google';


/**
 * Prépare les données des produits pour le contexte du chatbot
 */
export const prepareProductContext = (products: Product[]) => {
  return products.map(p => ({
    id: p.id,
    name: p.name,
    reference: p.reference,
    category: typeof p.category === 'string' ? p.category : p.category.join(', '),
    subCategory: typeof p.subCategory === 'string' ? p.subCategory : p.subCategory.join(', '),
    description: p.description,
    priceHT: p.priceHT,
    priceTTC: p.priceTTC,
    stock: p.stock,
    isAvailable: p.isAvailable,
    technicalSpecs: p.technicalSpecs
  }));
};

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
async function generateGoogleResponse(question: string, products: Product[]): Promise<ChatbotResponse> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return { error: "Erreur de configuration: Clé API Google Gemini manquante (VITE_GOOGLE_GEMINI_API_KEY).", source: 'google' };
    }

    // Limiter le nombre de produits pour éviter de dépasser la limite de tokens
    const limitedProducts = products.slice(0, 50);
    const productContext = prepareProductContext(limitedProducts);

    const systemPrompt = `Tu es un assistant virtuel pour ESIL Events, spécialiste de la location de matériel événementiel. 
    Tu as accès à la base de données des produits et tu dois aider les clients à trouver les produits qui correspondent à leurs besoins.
    
    Voici les règles à suivre:
    1. Réponds aux questions des clients de manière précise, professionnelle et conviviale.
    2. Si on te demande des informations sur un produit spécifique, cherche-le dans la base de données et fournis les détails pertinents.
    3. Si on te demande des recommandations, suggère des produits adaptés en fonction des critères mentionnés.
    4. Si tu ne connais pas la réponse ou si le produit demandé n'est pas dans la base de données, propose de contacter l'équipe commerciale.
    5. Mentionne toujours les prix TTC des produits quand tu les recommandes.
    6. N'invente jamais de produits ou de caractéristiques qui ne sont pas dans la base de données.
    7. Si on te demande des informations sur la disponibilité ou la livraison, indique que ces informations sont à confirmer avec l'équipe commerciale.
    
    Voici les informations sur nos produits (limité aux 50 premiers): ${JSON.stringify(productContext)}`;

    // Configuration de la requête pour Google Gemini
    const requestBody = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            { text: `Question du client: ${question}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        topP: 0.9
      }
    };

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
 */
export const generateChatbotResponse = async (question: string, products: Product[]): Promise<ChatbotResponse> => {
  try {
    // Vérifier si la clé API est disponible
    const googleApiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (!googleApiKey) {
      return { 
        error: "Erreur de configuration: Clé API Google Gemini manquante (VITE_GOOGLE_GEMINI_API_KEY).",
        source: 'fallback'
      };
    }

    try {
      // Générer la réponse avec Google
      const googleResponse = await generateGoogleResponse(question, products);
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
