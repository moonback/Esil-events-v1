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
Ton rôle est d'aider les utilisateurs à planifier leurs événements en leur suggérant le matériel approprié.

Directives importantes :
1. Sois professionnel, amical et précis dans tes recommandations
2. Pose des questions pertinentes pour mieux comprendre les besoins
3. Adapte tes suggestions en fonction du contexte (budget, nombre d'invités, style, etc.)
4. Propose des solutions créatives et personnalisées
5. N'hésite pas à suggérer des combinaisons de matériel complémentaires
6. Prends en compte les tendances actuelles en décoration événementielle

Format de réponse attendu (en JSON) :
{
  "message": "Message principal",
  "type": "text" | "product" | "moodboard" | "checklist",
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

IMPORTANT: Réponds UNIQUEMENT avec le JSON, sans backticks ni marqueurs de code.`;

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
    }
  }

  // Réponses basées sur le dernier message
  if (lastMessage.toLowerCase().includes('budget')) {
    replies.push('Souhaitez-vous voir des options dans différentes gammes de prix ?');
  }
  if (lastMessage.toLowerCase().includes('style') || lastMessage.toLowerCase().includes('thème')) {
    replies.push('Voulez-vous voir des exemples de décoration dans ce style ?');
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
    const { loadConfig } = useAdminService();
    const config = loadConfig();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chatHistory = formatChatHistory(history);
    
    const prompt = `${config.systemPrompt}

Contexte actuel:
${JSON.stringify(context, null, 2)}

Historique de la conversation:
${chatHistory}

Message de l'utilisateur: ${userInput}

Réponds uniquement au format JSON spécifié ci-dessus.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = cleanJsonResponse(text);
    const botResponse: BotResponse = JSON.parse(cleanedText);

    // Enrichir la réponse avec des suggestions dynamiques
    const lastMessage = history[history.length - 1]?.content || '';
    botResponse.quickReplies = getDynamicQuickReplies(context, lastMessage, config);

    return botResponse;
  } catch (error) {
    console.error('Erreur lors du traitement du message:', error);
    throw new Error('Une erreur est survenue lors du traitement de votre message.');
  }
};

export const formatChatHistory = (messages: Message[]): string => {
  return messages
    .map(msg => `${msg.sender === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`)
    .join('\n');
};

export const extractContextFromMessage = (message: string): Partial<ChatContext> => {
  const { loadConfig } = useAdminService();
  const config = loadConfig();
  const context: Partial<ChatContext> = {};

  // Extraction du budget
  if (message.toLowerCase().includes('budget')) {
    const budgetMatch = message.match(/\d+/);
    if (budgetMatch) {
      context.budget = parseInt(budgetMatch[0]);
    }
  }

  // Extraction du nombre d'invités
  if (message.toLowerCase().includes('personnes') || 
      message.toLowerCase().includes('invités') || 
      message.toLowerCase().includes('participants')) {
    const guestMatch = message.match(/\d+/);
    if (guestMatch) {
      context.guestCount = parseInt(guestMatch[0]);
    }
  }

  // Extraction du type d'événement
  for (const eventType of config.eventTypes) {
    if (message.toLowerCase().includes(eventType.id)) {
      context.eventType = eventType.id;
      break;
    }
  }

  // Extraction du style
  for (const style of config.styles) {
    if (style.keywords.some(keyword => message.toLowerCase().includes(keyword))) {
      context.style = style.id;
      break;
    }
  }

  // Extraction du thème
  for (const theme of config.themes) {
    if (theme.keywords.some(keyword => message.toLowerCase().includes(keyword))) {
      context.theme = theme.id;
      break;
    }
  }

  return context;
}; 