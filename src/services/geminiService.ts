import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialiser l'API Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY);

// Modèle Gemini Pro
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Interface pour le contexte de la conversation
interface ConversationContext {
  quoteRequests: any[];
  currentStats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  recentActions: string[];
}

// Fonction pour générer le prompt système
const generateSystemPrompt = (context: ConversationContext): string => {
  return `Tu es un assistant virtuel spécialisé dans la gestion des devis pour ESIL Events.
Tu as accès aux informations suivantes :
- Nombre total de devis : ${context.quoteRequests.length}
- Devis en attente : ${context.currentStats.pending}
- Devis approuvés : ${context.currentStats.approved}
- Devis refusés : ${context.currentStats.rejected}

Actions récentes : ${context.recentActions.join(', ')}

Tu dois :
1. Répondre en français de manière professionnelle et concise
2. Utiliser les données disponibles pour fournir des réponses précises
3. Suggérer des actions pertinentes basées sur le contexte
4. Formater les montants en euros
5. Utiliser des emojis appropriés pour améliorer la lisibilité
6. Proposer des suggestions contextuelles basées sur les données disponibles

Format de réponse attendu :
{
  "text": "Réponse principale",
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "actions": [
    {
      "label": "Action 1",
      "type": "button",
      "payload": "action_1"
    }
  ]
}`;
};

// Fonction pour formater la réponse de Gemini
const formatGeminiResponse = (response: string): any => {
  try {
    // Essayer de parser la réponse comme JSON
    const parsedResponse = JSON.parse(response);
    return parsedResponse;
  } catch (error) {
    // Si le parsing échoue, retourner un format par défaut
    return {
      text: response,
      suggestions: [],
      actions: []
    };
  }
};

// Fonction principale pour obtenir une réponse de Gemini
export const getGeminiResponse = async (
  userMessage: string,
  context: ConversationContext
): Promise<any> => {
  try {
    const systemPrompt = generateSystemPrompt(context);
    
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: "Je comprends mon rôle et je suis prêt à vous aider avec la gestion des devis." }],
        },
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return formatGeminiResponse(text);
  } catch (error) {
    console.error('Erreur lors de l\'appel à Gemini:', error);
    return {
      text: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer.",
      suggestions: ["Aide", "Statistiques des devis", "Devis en attente"],
      actions: []
    };
  }
}; 