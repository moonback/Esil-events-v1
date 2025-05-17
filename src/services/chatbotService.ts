import { Message, BotResponse } from '../components/chat/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAdminService } from './adminService';

interface ChatContext {
  eventType?: string;
  budget?: number;
  date?: Date;
  location?: string;
  guestCount?: number;
  theme?: string;
  style?: string;
  preferences?: string[];
}

// Initialiser l'API Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `Tu es un assistant expert en événementiel, spécialisé dans la location de matériel pour événements.
Ton rôle est d'aider les utilisateurs à planifier leurs événements en leur suggérant le matériel approprié et des inspirations visuelles.

Directives importantes :
1. Sois professionnel, amical et précis dans tes recommandations
2. Pose des questions pertinentes pour mieux comprendre les besoins
3. Adapte tes suggestions en fonction du contexte (budget, nombre d'invités, style, etc.)
4. Propose des solutions créatives et personnalisées
5. N'hésite pas à suggérer des combinaisons de matériel complémentaires
6. Prends en compte les tendances actuelles en décoration événementielle
7. Suggère des moodboards pertinents pour inspirer les utilisateurs

IMPORTANT - Format de réponse REQUIS (en JSON) :
{
  "message": "Message principal (obligatoire)",
  "type": "text" | "product" | "moodboard" | "checklist" (obligatoire, défaut: "text"),
  "metadata": {
    "productId": "ID du produit suggéré",
    "moodboardId": "ID du moodboard",
    "checklistId": "ID de la checklist",
    "eventType": "Type d'événement",
    "theme": "Thème de l'événement",
    "style": "Style décoratif"
  },
  "quickReplies": ["Réponse rapide 1", "Réponse rapide 2"]
}

RÈGLES STRICTES :
1. Réponds UNIQUEMENT avec le JSON ci-dessus
2. Le champ "message" est OBLIGATOIRE et ne doit jamais être vide
3. Le champ "type" est OBLIGATOIRE et doit être l'un des types listés
4. Les champs "metadata" et "quickReplies" sont optionnels
5. Ne mets pas de backticks ou de marqueurs de code autour du JSON
6. Assure-toi que le JSON est valide et bien formaté`;

const cleanJsonResponse = (text: string): string => {
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  cleaned = cleaned.trim();
  return cleaned;
};

const getDynamicQuickReplies = (context: ChatContext, lastMessage: string, config: any): string[] => {
  const replies: string[] = [];
  
  // Réponses basées sur le type d'événement
  if (context.eventType) {
    const eventTypeConfig = config.eventTypes.find((et: any) => et.id === context.eventType);
    if (eventTypeConfig) {
      // Utiliser les réponses rapides configurées pour ce type d'événement
      if (config.quickReplies.eventTypes[context.eventType]) {
        replies.push(...config.quickReplies.eventTypes[context.eventType]);
      }

      // Ajouter des suggestions basées sur les styles et thèmes disponibles
      if (!context.style && eventTypeConfig.styles.length > 0) {
        replies.push(`Quel style préférez-vous parmi : ${eventTypeConfig.styles.join(', ')} ?`);
      }
      if (!context.theme && eventTypeConfig.themes.length > 0) {
        replies.push(`Quel thème vous inspire le plus : ${eventTypeConfig.themes.join(', ')} ?`);
      }
      
      // Ajouter une suggestion de moodboard
      replies.push(`Voulez-vous voir des inspirations visuelles pour votre ${context.eventType} ?`);
    }
  }

  // Réponses basées sur le dernier message
  if (lastMessage.toLowerCase().includes('budget')) {
    replies.push('Souhaitez-vous voir des options dans différentes gammes de prix ?');
  }
  if (lastMessage.toLowerCase().includes('style') || lastMessage.toLowerCase().includes('thème')) {
    replies.push('Voulez-vous voir des exemples de décoration dans ce style ?');
  }
  if (lastMessage.toLowerCase().includes('inspiration') || lastMessage.toLowerCase().includes('idée')) {
    replies.push('Je peux vous montrer des moodboards d\'inspiration');
  }
  if (lastMessage.toLowerCase().includes('invités') || lastMessage.toLowerCase().includes('personnes')) {
    replies.push('Souhaitez-vous des suggestions adaptées à ce nombre de personnes ?');
  }

  // Réponses génériques si pas assez de réponses contextuelles
  if (replies.length < 3) {
    replies.push(...config.quickReplies.generic);
  }

  // Retourner un maximum de 4 réponses
  return replies.slice(0, 4);
};

export const processUserMessage = async (
  history: Message[],
  userInput: string,
  context: ChatContext
): Promise<BotResponse> => {
  try {
    console.log('🚀 Début du traitement du message:', { userInput, context });
    
    const { loadConfig } = useAdminService();
    const config = loadConfig();
    console.log('📋 Configuration chargée:', config);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('🔑 API Key présente:', !!apiKey);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chatHistory = formatChatHistory(history);
    
    const prompt = `${config.systemPrompt}

Contexte actuel:
${JSON.stringify(context, null, 2)}

Historique de la conversation:
${chatHistory}

Message de l'utilisateur: ${userInput}

Réponds uniquement au format JSON spécifié ci-dessus.`;

    console.log('📝 Prompt préparé:', prompt);

    console.log('⏳ Envoi de la requête à Gemini...');
    const result = await model.generateContent(prompt);
    console.log('✅ Réponse reçue de Gemini');
    
    const response = await result.response;
    const text = response.text();
    console.log('📨 Texte brut reçu:', text);
    
    const cleanedText = cleanJsonResponse(text);
    console.log('🧹 Texte nettoyé:', cleanedText);
    
    let botResponse: BotResponse;
    try {
      botResponse = JSON.parse(cleanedText);
      console.log('🔄 Réponse parsée:', botResponse);

      // Ensure the response has the required fields with defaults
      botResponse = {
        message: botResponse.message || 'Je ne peux pas répondre pour le moment.',
        type: botResponse.type || 'text',
        metadata: botResponse.metadata || {},
        quickReplies: botResponse.quickReplies || []
      };
      
      console.log('✨ Réponse finale avec valeurs par défaut:', botResponse);
    } catch (parseError) {
      console.error('❌ Erreur de parsing JSON:', parseError);
      console.error('Texte qui a causé l\'erreur:', cleanedText);
      // Return a default response if parsing fails
      botResponse = {
        message: 'Je ne peux pas traiter votre message pour le moment. Veuillez réessayer.',
        type: 'text',
        metadata: {},
        quickReplies: []
      };
    }

    // Enrichir la réponse avec des suggestions dynamiques
    const lastMessage = history[history.length - 1]?.content || '';
    botResponse.quickReplies = getDynamicQuickReplies(context, lastMessage, config);
    console.log('✨ Réponse finale avec suggestions:', botResponse);

    return botResponse;
  } catch (error) {
    console.error('❌ Erreur détaillée:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    throw new Error('Une erreur est survenue lors du traitement de votre message.');
  }
};

export const formatChatHistory = (messages: Message[]): string => {
  return messages
    .map(msg => `${msg.sender === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`)
    .join('\n');
};

export const extractContextFromMessage = (message: string): Partial<ChatContext> => {
  console.log('🔍 Extraction du contexte du message:', message);
  
  const { loadConfig } = useAdminService();
  const config = loadConfig();
  const context: Partial<ChatContext> = {};

  // Extraction du budget
  if (message.toLowerCase().includes('budget')) {
    const budgetMatch = message.match(/\d+/);
    if (budgetMatch) {
      context.budget = parseInt(budgetMatch[0]);
      console.log('💰 Budget extrait:', context.budget);
    }
  }

  // Extraction du nombre d'invités
  if (message.toLowerCase().includes('personnes') || 
      message.toLowerCase().includes('invités') || 
      message.toLowerCase().includes('participants')) {
    const guestMatch = message.match(/\d+/);
    if (guestMatch) {
      context.guestCount = parseInt(guestMatch[0]);
      console.log('👥 Nombre d\'invités extrait:', context.guestCount);
    }
  }

  // Extraction du type d'événement
  for (const eventType of config.eventTypes) {
    if (message.toLowerCase().includes(eventType.id)) {
      context.eventType = eventType.id;
      console.log('🎉 Type d\'événement extrait:', context.eventType);
      break;
    }
  }

  // Extraction du style
  for (const style of config.styles) {
    if (style.keywords.some(keyword => message.toLowerCase().includes(keyword))) {
      context.style = style.id;
      console.log('🎨 Style extrait:', context.style);
      break;
    }
  }

  // Extraction du thème
  for (const theme of config.themes) {
    if (theme.keywords.some(keyword => message.toLowerCase().includes(keyword))) {
      context.theme = theme.id;
      console.log('🎭 Thème extrait:', context.theme);
      break;
    }
  }

  console.log('📊 Contexte final extrait:', context);
  return context;
}; 