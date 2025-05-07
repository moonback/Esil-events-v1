import { generateAIResponse } from './aiResponseService';

/**
 * Service pour gérer les interactions avec le chatbot Gemini
 */

// Interface pour les messages du chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  conversationId?: string;
}

// Interface pour les options de conversation
export interface ChatOptions {
  tone?: 'formal' | 'friendly' | 'persuasive';
  responseLength?: 'concise' | 'standard' | 'detailed';
}

/**
 * Prépare la requête pour l'API Google Gemini
 */
const prepareGeminiRequest = (messages: ChatMessage[], options?: ChatOptions) => {
  // Extraire le contexte système et l'historique des conversations
  const systemPrompt = `Tu es un assistant virtuel pour ESIL Events, spécialiste de la location de mobilier événementiel premium. 
  Réponds aux questions des utilisateurs de manière ${options?.tone || 'professionnelle'} et ${options?.responseLength || 'standard'}.
  Ton rôle est d'aider les visiteurs du site à trouver des informations sur nos services, nos produits, et à répondre à leurs questions concernant l'organisation d'événements.
  Mets en avant l'expertise d'ESIL Events dans le domaine de l'événementiel et notre engagement pour la qualité et l'élégance.
  Si tu ne connais pas la réponse à une question, propose de mettre l'utilisateur en contact avec notre équipe via le formulaire de contact ou par téléphone au 06 20 46 13 85.
  IMPORTANT: Maintiens le contexte de la conversation et fais référence aux échanges précédents lorsque c'est pertinent.`;
  
  // Formater l'historique des messages pour Gemini avec indication des rôles
  const conversationHistory = messages.slice(0, -1).map(msg => 
    `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`
  ).join('\n');
  
  // Dernière question de l'utilisateur (le dernier message)
  const lastUserMessage = messages[messages.length - 1].content;

  return {
    contents: [
      {
        parts: [
          { text: systemPrompt },
          { text: `Historique de la conversation:\n${conversationHistory}` },
          { text: `Question de l'utilisateur: ${lastUserMessage}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800,
      topP: 0.9
    }
  };
};

/**
 * Fonction pour effectuer une requête API Google Gemini avec retry
 */
async function makeGeminiApiRequest(requestBody: any, apiKey: string, retryCount = 0, maxRetries = 3): Promise<any> {
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
      return makeGeminiApiRequest(requestBody, apiKey, retryCount + 1, maxRetries);
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
      return makeGeminiApiRequest(requestBody, apiKey, retryCount + 1, maxRetries);
    }
    throw error;
  }
}

/**
 * Envoie un message au chatbot et récupère la réponse
 */
export const sendMessageToChatbot = async (messages: ChatMessage[], options?: ChatOptions): Promise<{ response?: string; error?: string }> => {
  try {
    // Récupérer la clé API Gemini
    const geminiApiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return { error: 'Erreur de configuration: Clé API Google Gemini manquante (VITE_GOOGLE_GEMINI_API_KEY).' };
    }

    // Préparer la requête pour Gemini
    const requestBody = prepareGeminiRequest(messages, options);

    // Appeler l'API Gemini
    const data = await makeGeminiApiRequest(requestBody, geminiApiKey);
    const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedContent) {
      throw new Error("La réponse de l'API est vide ou mal structurée.");
    }

    return { response: generatedContent };
  } catch (err: any) {
    console.error('Erreur détaillée lors de la génération de la réponse du chatbot:', err);
    return { error: `Erreur lors de la génération de la réponse: ${err.message}` };
  }
};