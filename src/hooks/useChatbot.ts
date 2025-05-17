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
      console.log('Sending message:', content);
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

      console.log('Created user message:', userMessage);

      // Ajoute le message utilisateur à l'historique local
      const updatedHistory = [...state.messages, userMessage];
      setState(prev => {
        const newState = {
          ...prev,
          messages: updatedHistory
        };
        console.log('Updated state with user message:', newState);
        return newState;
      });

      // Extraire le contexte du message et le mettre à jour localement
      const newContext = extractContextFromMessage(content);
      const updatedContext = { ...state.context, ...newContext };
      setState(prev => ({
        ...prev,
        context: updatedContext
      }));
      console.log('Extracted context:', newContext);
      console.log('Updated context for API:', updatedContext);

      // Appeler le service de chatbot avec l'historique et le contexte à jour
      console.log('Calling processUserMessage with:', {
        messages: updatedHistory,
        content,
        context: updatedContext
      });
      const response = await processUserMessage(
        updatedHistory,
        content,
        updatedContext
      );
      console.log('Received bot response:', response);

      // Create bot message with safe defaults
      const botMessage: Message = {
        id: uuidv4(),
        content: response?.message || 'Je ne peux pas répondre pour le moment.',
        sender: 'bot',
        timestamp: new Date(),
        type: response?.type || 'text',
        metadata: {
          ...(response?.metadata || {}),
          quickReplies: response?.quickReplies || []
        }
      };
      console.log('Created bot message:', botMessage);

      setState(prev => {
        const newState = {
          ...prev,
          messages: [...prev.messages, botMessage],
          isLoading: false
        };
        console.log('Updated state with bot message:', newState);
        return newState;
      });

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