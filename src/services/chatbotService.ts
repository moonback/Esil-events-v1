import { Message, BotResponse } from '../components/chat/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

const getDynamicQuickReplies = (context: ChatContext, lastMessage: string): string[] => {
  const replies: string[] = [];
  
  // Réponses basées sur le type d'événement
  if (context.eventType) {
    switch (context.eventType.toLowerCase()) {
      case 'mariage':
        if (!context.style) {
          replies.push('Quel style de mariage recherchez-vous ? (Rustique, Moderne, Classique, Bohème)');
        }
        if (!context.theme) {
          replies.push('Avez-vous un thème ou une palette de couleurs en tête ?');
        }
        if (!context.budget) {
          replies.push('Quel est votre budget pour la décoration ?');
        }
        if (!context.guestCount) {
          replies.push('Combien d\'invités prévoyez-vous ?');
        }
        replies.push('Souhaitez-vous voir des exemples de décoration ?');
        break;
        
      case 'entreprise':
        if (!context.theme) {
          replies.push('Quel thème souhaitez-vous pour votre événement d\'entreprise ?');
        }
        if (!context.guestCount) {
          replies.push('Combien de participants seront présents ?');
        }
        replies.push('Avez-vous besoin de matériel audiovisuel ?');
        replies.push('Souhaitez-vous une décoration particulière ?');
        break;
        
      default:
        if (!context.eventType) {
          replies.push('Quel type d\'événement organisez-vous ?');
        }
        if (!context.budget) {
          replies.push('Quel est votre budget ?');
        }
        if (!context.guestCount) {
          replies.push('Combien de personnes seront présentes ?');
        }
        replies.push('Avez-vous des préférences particulières ?');
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
    replies.push('Avez-vous des questions spécifiques sur le matériel ?');
    replies.push('Souhaitez-vous voir des exemples de décoration ?');
    replies.push('Avez-vous besoin d\'aide pour la planification ?');
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chatHistory = formatChatHistory(history);
    
    const prompt = `${SYSTEM_PROMPT}

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
    botResponse.quickReplies = getDynamicQuickReplies(context, lastMessage);

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
  const eventTypes = ['mariage', 'anniversaire', 'entreprise', 'conférence', 'séminaire', 'cocktail', 'gala'];
  for (const type of eventTypes) {
    if (message.toLowerCase().includes(type)) {
      context.eventType = type;
      break;
    }
  }

  // Extraction du style
  const styles = ['moderne', 'classique', 'rustique', 'bohème', 'industriel', 'minimaliste', 'luxe'];
  for (const style of styles) {
    if (message.toLowerCase().includes(style)) {
      context.style = style;
      break;
    }
  }

  // Extraction du thème
  const themes = ['romantique', 'tropical', 'vintage', 'naturel', 'urbain', 'chic', 'festif'];
  for (const theme of themes) {
    if (message.toLowerCase().includes(theme)) {
      context.theme = theme;
      break;
    }
  }

  return context;
}; 