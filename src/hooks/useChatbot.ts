import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, ChatAction } from '../types/chatbot';
import { processMessage } from '../services/chatbotService';
import { QuoteRequest } from '../services/quoteRequestService';

const STORAGE_KEY = 'chatbot_conversation';

// Fonction utilitaire pour sauvegarder les messages dans le localStorage
const saveMessagesToStorage = (messages: ChatMessage[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des messages:', error);
  }
};

// Fonction utilitaire pour charger les messages depuis le localStorage
const loadMessagesFromStorage = (): ChatMessage[] => {
  try {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      // Convertir les timestamps en objets Date
      return parsedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
  } catch (error) {
    console.error('Erreur lors du chargement des messages:', error);
  }
  return [];
};

interface UseChatbotReturn {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  handleSendMessage: (message: string) => Promise<void>;
  toggleChatbot: () => void;
  addMessage: (text: string, sender: 'user' | 'bot', actions?: ChatAction[], isTyping?: boolean) => void;
  handleChatAction: (action: ChatAction) => void;
  clearChatHistory: () => void;
}

export const useChatbot = (
  initialQuoteRequests: QuoteRequest[],
  handleActionPayload?: (payload: string) => void
): UseChatbotReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessagesFromStorage());
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>(initialQuoteRequests);

  // Sauvegarder les messages dans le localStorage à chaque changement
  useEffect(() => {
    saveMessagesToStorage(messages);
  }, [messages]);

  // Mettre à jour les quoteRequests si initialQuoteRequests change
  useEffect(() => {
    setQuoteRequests(initialQuoteRequests);
  }, [initialQuoteRequests]);

  const addMessage = useCallback((text: string, sender: 'user' | 'bot', actions?: ChatAction[], isTyping?: boolean) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(16).substring(2),
      text,
      sender,
      timestamp: new Date(),
      actions,
      isTyping
    };
    setMessages(prevMessages => {
      // Si le message précédent était un message de frappe du bot, le remplacer
      if (isTyping === false && prevMessages.length > 0 && prevMessages[prevMessages.length - 1].isTyping) {
        const updatedMessages = [...prevMessages.slice(0, -1), newMessage];
        return updatedMessages;
      }
      return [...prevMessages, newMessage];
    });
  }, []);
  
  const removeTypingIndicator = useCallback(() => {
    setMessages(prev => prev.filter(msg => !msg.isTyping));
  }, []);

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;
    addMessage(userInput, 'user');
    addMessage("...", 'bot', undefined, true); // Indicateur de frappe
    setIsLoading(true);

    try {
      const botResponse = await processMessage(userInput, quoteRequests);
      removeTypingIndicator(); // Enlever l'indicateur avant d'ajouter la vraie réponse
      addMessage(botResponse.text, 'bot', botResponse.actions, false);
    } catch (error) {
      removeTypingIndicator();
      addMessage("Désolé, une erreur est survenue. Veuillez réessayer.", 'bot', undefined, false);
      console.error("Error processing message:", error);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, quoteRequests, removeTypingIndicator]);

  const handleChatAction = useCallback((action: ChatAction) => {
    console.log("Action cliquée:", action);
    if (handleActionPayload) {
      handleActionPayload(action.payload);
    } else {
      // Logique par défaut si aucune fonction de gestion n'est fournie
      addMessage(`Action "${action.label}" cliquée avec payload: ${action.payload}`, 'user');
    }
  }, [addMessage, handleActionPayload]);

  const toggleChatbot = useCallback(() => setIsOpen(prev => !prev), []);
  
  // Message de bienvenue
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addMessage("Bonjour ! Je suis l'assistant ESIL Events. Comment puis-je vous aider avec les devis aujourd'hui ? Tapez 'aide' pour voir mes commandes.", 'bot');
    }
  }, [isOpen, messages.length, addMessage]);

  // Fonction pour effacer l'historique des conversations
  const clearChatHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    messages,
    isOpen,
    isLoading,
    handleSendMessage,
    toggleChatbot,
    addMessage,
    handleChatAction,
    clearChatHistory
  };
}; 