import { useState, useCallback } from 'react';
import { Message, ChatState, BotResponse } from '../components/chat/types';
import { v4 as uuidv4 } from 'uuid';
import { processUserMessage, extractContextFromMessage } from '../services/chatbotService';

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  isOpen: false,
  context: {}
};

export const useChatbot = () => {
  const [state, setState] = useState<ChatState>(initialState);

  const sendMessage = useCallback(async (content: string) => {
    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      // Créer le message de l'utilisateur
      const userMessage: Message = {
        id: uuidv4(),
        content,
        sender: 'user',
        timestamp: new Date(),
        type: 'text'
      };

      // Ajouter le message de l'utilisateur
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage]
      }));

      // Extraire le contexte du message
      const newContext = extractContextFromMessage(content);
      
      // Mettre à jour le contexte
      setState(prev => ({
        ...prev,
        context: {
          ...prev.context,
          ...newContext
        }
      }));

      // Appeler le service de chatbot
      const response = await processUserMessage(
        state.messages,
        content,
        state.context
      );

      // Créer le message du bot
      const botMessage: Message = {
        id: uuidv4(),
        content: response.message,
        sender: 'bot',
        timestamp: new Date(),
        type: response.type,
        metadata: {
          ...response.metadata,
          quickReplies: response.quickReplies
        }
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isLoading: false
      }));

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
        isLoading: false
      }));
    }
  }, [state.messages, state.context]);

  const toggleChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  }, []);

  const resetChat = useCallback(() => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser la conversation ?')) {
      setState(prev => ({
        ...prev,
        messages: [],
        context: {},
        error: null
      }));
    }
  }, []);

  const updateContext = useCallback((newContext: Partial<ChatState['context']>) => {
    setState(prev => ({
      ...prev,
      context: {
        ...prev.context,
        ...newContext
      }
    }));
  }, []);

  return {
    ...state,
    sendMessage,
    toggleChat,
    updateContext,
    resetChat
  };
}; 