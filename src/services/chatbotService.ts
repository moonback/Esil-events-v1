import { supabase } from './supabaseClient';
import { searchProducts } from './productService';
import { generateAndSendQuoteEmail, QuoteGenerationOptions } from './quoteEmailService';
import { getQuoteRequestById } from './quoteRequestService';

// Types pour le chatbot
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  messages: ChatMessage[];
}

// Options pour la génération de réponses
export interface ChatbotOptions {
  includeProductInfo?: boolean;
  maxProductsToInclude?: number;
  currentUrl?: string; // URL actuelle pour le contexte de navigation
  cartItems?: any[]; // Éléments du panier pour des suggestions personnalisées
}

/**
 * Analyse l'intention de l'utilisateur à partir de son message
 * @param message Le message de l'utilisateur
 * @returns Le type d'intention identifié
 */
export const analyzeIntent = (message: string): 'product_search' | 'product_info' | 'quote_request' | 'general_question' => {
  const lowerMessage = message.toLowerCase();
  
  // Recherche de produits
  if (
    lowerMessage.includes('cherche') ||
    lowerMessage.includes('recherche') ||
    lowerMessage.includes('trouve') ||
    lowerMessage.includes('avez-vous') ||
    lowerMessage.includes('avez vous') ||
    lowerMessage.includes('proposez') ||
    lowerMessage.includes('vendez')
  ) {
    return 'product_search';
  }
  
  // Information sur un produit
  if (
    lowerMessage.includes('information') ||
    lowerMessage.includes('détail') ||
    lowerMessage.includes('caractéristique') ||
    lowerMessage.includes('spécification') ||
    lowerMessage.includes('prix de') ||
    lowerMessage.includes('coûte') ||
    lowerMessage.includes('disponible')
  ) {
    return 'product_info';
  }
  
  // Demande de devis
  if (
    lowerMessage.includes('devis') ||
    lowerMessage.includes('générer un devis') ||
    lowerMessage.includes('envoyer un devis') ||
    lowerMessage.includes('créer un devis') ||
    lowerMessage.includes('faire un devis') ||
    (lowerMessage.includes('envoyer') && lowerMessage.includes('mail') && lowerMessage.includes('devis')) ||
    (lowerMessage.includes('envoyer') && lowerMessage.includes('email') && lowerMessage.includes('devis'))
  ) {
    return 'quote_request';
  }
  
  // Question générale par défaut
  return 'general_question';
};

/**
 * Extrait les mots-clés pertinents d'un message
 * @param message Le message de l'utilisateur
 * @returns Un tableau de mots-clés
 */
export const extractKeywords = (message: string): string[] => {
  // Liste de mots à ignorer (articles, prépositions, etc.)
  const stopWords = [
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'à', 'au', 'aux',
    'et', 'ou', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
    'ce', 'cette', 'ces', 'mon', 'ton', 'son', 'notre', 'votre', 'leur',
    'pour', 'par', 'en', 'dans', 'sur', 'sous', 'avec', 'sans', 'chez',
    'qui', 'que', 'quoi', 'dont', 'où', 'comment', 'pourquoi', 'quand',
    'est', 'sont', 'sera', 'seront', 'était', 'étaient', 'avoir', 'avez',
    'cherche', 'recherche', 'information', 'détail', 'besoin', 'veux', 'voudrais'
  ];
  
  // Nettoyer et tokenizer le message
  const words = message
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .split(/\s+/);
  
  // Filtrer les mots vides et les mots trop courts
  return words
    .filter(word => !stopWords.includes(word) && word.length > 2)
    .slice(0, 5); // Limiter à 5 mots-clés maximum
};

/**
 * Prépare le prompt pour le modèle de langage
 * @param message Le message de l'utilisateur
 * @param history L'historique de la conversation
 * @param productContext Le contexte des produits trouvés
 * @returns Le prompt formaté
 */
export const preparePrompt = (
  message: string,
  history: ChatMessage[],
  productContext: string,
  currentUrl?: string,
  cartItems?: any[]
): string => {
  const historyText = history
    .slice(-6) // Limiter à 6 derniers messages pour éviter un prompt trop long
    .map(msg => `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  // Préparer le contexte de navigation
  let navigationContext = '';
  if (currentUrl) {
    navigationContext = `L'utilisateur est actuellement sur la page: ${currentUrl}\n`;
  }

  // Préparer le contexte du panier
  let cartContext = '';
  if (cartItems && cartItems.length > 0) {
    cartContext = `Panier actuel de l'utilisateur:\n`;
    cartItems.forEach(item => {
      cartContext += `- ${item.name} (Quantité: ${item.quantity}, Prix: ${item.priceTTC.toFixed(2)}€)\n`;
    });
  }

  return `
    Tu es un assistant chatbot pour ESIL Events, une entreprise de location de matériel événementiel.
    Ton but est d'aider les utilisateurs à trouver des produits, obtenir des informations et faire des suggestions.
    Sois amical, professionnel et concis. Utilise les informations de la base de données fournies lorsque c'est pertinent.

    Historique de la conversation:
    ${historyText}

    ${navigationContext}
    ${cartContext}
    Informations produits pertinentes (si disponibles):
    ${productContext}

    Question de l'utilisateur: ${message}

    Ta réponse:
  `;
};

/**
 * Génère une réponse pour le chatbot en utilisant l'API Google Gemini
 * @param message Le message de l'utilisateur
 * @param history L'historique de la conversation
 * @param options Options pour la génération de réponse
 * @returns La réponse générée
 */
export const generateChatbotResponse = async (
  message: string,
  history: ChatMessage[],
  options: ChatbotOptions = {}
): Promise<{ response?: string; error?: string }> => {
  try {
    // Valeurs par défaut pour les options
    const includeProductInfo = options.includeProductInfo !== false;
    const maxProductsToInclude = options.maxProductsToInclude || 3;

    // 1. Analyser l'intention de l'utilisateur
    const intent = analyzeIntent(message);

    // 2. Préparer le contexte des produits si nécessaire
    let productContext = '';
    if (includeProductInfo && (intent === 'product_search' || intent === 'product_info')) {
      // Extraire les mots-clés du message
      const keywords = extractKeywords(message);
      
      // Rechercher des produits pertinents
      if (keywords.length > 0) {
        const products = await searchProducts(keywords.join(' '));

        if (products.length > 0) {
          productContext = `Voici quelques produits pertinents trouvés dans la base de données :\n`;
          productContext += products.slice(0, maxProductsToInclude).map(p =>
            `- ${p.name} (Réf: ${p.reference}, Prix: ${p.priceTTC.toFixed(2)}€, Stock: ${p.stock > 0 ? 'Disponible' : 'Indisponible'}): ${p.description.substring(0, 100)}...`
          ).join('\n');
          productContext += `\nRéponds à la question de l'utilisateur en te basant sur ces informations si elles sont pertinentes. Sinon, indique que tu n'as pas trouvé d'information spécifique mais propose d'explorer les catégories.`;
        } else {
          productContext = "Aucun produit spécifique correspondant n'a été trouvé dans la base de données. Propose à l'utilisateur d'explorer les catégories ou de reformuler sa question.";
        }
      }
    }

    // 3. Préparer le prompt pour le modèle de langage avec le contexte de navigation et du panier
    const prompt = preparePrompt(
      message, 
      history, 
      productContext, 
      options.currentUrl, 
      options.cartItems
    );

    // 4. Appeler l'API du modèle de langage (Google Gemini)
    const geminiApiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return { error: 'Erreur de configuration: Clé API Google Gemini manquante (VITE_GOOGLE_GEMINI_API_KEY).' };
    }

    // Préparer la requête pour Gemini
    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        topP: 0.9
      }
    };

    // Appeler l'API Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      let errorData;
      try {
        const errorText = await response.text();
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        errorData = { error: { message: `Erreur ${response.status}: ${response.statusText}. Réponse non JSON.` } };
      }
      
      throw new Error(`Erreur API Google (${response.status}): ${errorData?.error?.message || response.statusText || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedContent) {
      throw new Error("La réponse de l'API est vide ou mal structurée.");
    }

    return { response: generatedContent };
  } catch (err: any) {
    console.error('Erreur détaillée lors de la génération de la réponse chatbot:', err);
    return { error: `Erreur lors de la génération de la réponse: ${err.message}` };
  }
};

/**
 * Sauvegarde une session de chat dans le localStorage
 * @param sessionId Identifiant de la session
 * @param session Données de la session
 */
export const saveChatSession = (sessionId: string, session: ChatSession): void => {
  localStorage.setItem(`chat_session_${sessionId}`, JSON.stringify(session));
};

/**
 * Récupère une session de chat depuis le localStorage
 * @param sessionId Identifiant de la session
 * @returns La session de chat ou une nouvelle session si non trouvée
 */
export const loadChatSession = (sessionId: string): ChatSession => {
  const savedSession = localStorage.getItem(`chat_session_${sessionId}`);
  if (savedSession) {
    return JSON.parse(savedSession);
  }
  return { messages: [] };
};

/**
 * Extrait l'ID de la demande de devis à partir du message de l'utilisateur
 * @param message Le message de l'utilisateur
 * @returns L'ID de la demande de devis ou null si non trouvé
 */
export const extractQuoteRequestId = (message: string): string | null => {
  // Recherche d'un ID au format UUID (pattern simplifié)
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const uuidMatch = message.match(uuidPattern);
  
  if (uuidMatch) {
    return uuidMatch[0];
  }
  
  // Recherche d'un ID au format "devis #12345678" ou "demande #12345678"
  const idPattern = /#([0-9a-zA-Z]{8})/;
  const idMatch = message.match(idPattern);
  
  if (idMatch && idMatch[1]) {
    // Rechercher l'ID complet dans la base de données à partir de ce préfixe
    return idMatch[1];
  }
  
  return null;
};

/**
 * Génère et envoie un devis par email via le chatbot
 * @param message Le message de l'utilisateur contenant la demande de devis
 * @returns Résultat de l'opération avec message de réponse
 */
export const handleQuoteRequestViaChatbot = async (
  message: string
): Promise<{ success: boolean; response: string; error?: string }> => {
  try {
    // 1. Extraire l'ID de la demande de devis du message
    const quoteRequestId = extractQuoteRequestId(message);
    
    if (!quoteRequestId) {
      return {
        success: false,
        response: "Je n'ai pas pu identifier la demande de devis. Veuillez préciser le numéro de la demande (par exemple #12345678) ou fournir l'identifiant complet."
      };
    }
    
    // 2. Vérifier si la demande existe
    const { data: quoteRequest, error: quoteError } = await getQuoteRequestById(quoteRequestId);
    
    if (quoteError || !quoteRequest) {
      return {
        success: false,
        response: `Je n'ai pas trouvé de demande de devis correspondant à l'identifiant ${quoteRequestId}. Veuillez vérifier et réessayer.`
      };
    }
    
    // 3. Extraire les options de génération du message (promotions, notes, etc.)
    const options: QuoteGenerationOptions = {};
    
    // Vérifier si une promotion est mentionnée
    if (message.toLowerCase().includes('promotion') || message.toLowerCase().includes('remise')) {
      options.includePromotion = true;
      
      // Essayer d'extraire les détails de la promotion
      const promotionMatch = message.match(/promotion[\s:]+(.*?)(?:\.|$)/i);
      if (promotionMatch && promotionMatch[1]) {
        options.promotionDetails = promotionMatch[1].trim();
      }
    }
    
    // Vérifier si des notes additionnelles sont mentionnées
    if (message.toLowerCase().includes('note') || message.toLowerCase().includes('commentaire')) {
      const notesMatch = message.match(/notes?[\s:]+(.*?)(?:\.|$)/i) || message.match(/commentaires?[\s:]+(.*?)(?:\.|$)/i);
      if (notesMatch && notesMatch[1]) {
        options.additionalNotes = notesMatch[1].trim();
      }
    }
    
    // Vérifier si une période de validité est mentionnée
    const validityMatch = message.match(/(\d+)\s*jours/i);
    if (validityMatch && validityMatch[1]) {
      options.validityPeriod = parseInt(validityMatch[1], 10);
    }
    
    // 4. Générer et envoyer le devis
    const result = await generateAndSendQuoteEmail(quoteRequestId, options);
    
    if (!result.success) {
      return {
        success: false,
        response: `Une erreur est survenue lors de la génération du devis: ${result.error}. Veuillez réessayer ultérieurement ou contacter notre équipe.`,
        error: result.error
      };
    }
    
    if (!result.emailSent) {
      return {
        success: true,
        response: `Le devis a été généré avec succès, mais l'envoi par email a échoué: ${result.error}. Veuillez vérifier l'adresse email ou réessayer ultérieurement.`,
        error: result.error
      };
    }
    
    return {
      success: true,
      response: `Le devis a été généré et envoyé avec succès à ${quoteRequest.email}. Le client recevra un email contenant tous les détails de sa demande.`
    };
    
  } catch (error: any) {
    console.error('Erreur lors du traitement de la demande de devis via chatbot:', error);
    return {
      success: false,
      response: `Une erreur inattendue est survenue: ${error.message}. Veuillez réessayer ultérieurement ou contacter notre équipe.`,
      error: error.message
    };
  }
};