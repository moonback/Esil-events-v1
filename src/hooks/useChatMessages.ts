import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/Product';
import { saveConversationContext } from '../services/chatbotService';

/**
 * Interface pour un message de chat
 */
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isNew?: boolean;
  mentionedProducts?: Product[];
  source?: 'google' | 'fallback' | 'cache';
}

/**
 * Options pour le hook useChatMessages
 */
interface UseChatMessagesOptions {
  initialWelcomeMessage?: string;
  saveToLocalStorage?: boolean;
}

/**
 * Hook personnalisé pour gérer les messages du chat
 */
export const useChatMessages = (options: UseChatMessagesOptions = {}) => {
  const {
    initialWelcomeMessage = "Bienvenue chez ESIL Events. Je suis votre conseiller expert en solutions événementielles, spécialisé dans l'accompagnement et la location d'équipements professionnels. Pour vous proposer une sélection adaptée à vos besoins spécifiques, j'aurais besoin de quelques informations essentielles concernant votre projet de location ou de recherche de prestataire : la nature de votre événement, la date envisagée, ainsi que votre budget prévisionnel. Comment puis-je vous accompagner aujourd'hui ?",
    saveToLocalStorage = true
  } = options;

  // État des messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Charger les messages depuis le localStorage au montage du composant
  useEffect(() => {
    if (saveToLocalStorage) {
      const savedMessages = localStorage.getItem('chatHistory');
      
      if (savedMessages && JSON.parse(savedMessages).length > 0) {
        // Convertir les timestamps en objets Date
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } else {
        // Ajouter un message de bienvenue si pas d'historique
        setMessages([{
          id: Date.now().toString(),
          text: initialWelcomeMessage,
          sender: 'bot',
          timestamp: new Date(),
          isNew: true
        }]);
      }
    }
  }, [initialWelcomeMessage, saveToLocalStorage]);

  // Sauvegarder les messages dans localStorage quand ils changent
  useEffect(() => {
    if (saveToLocalStorage && messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
      
      // Sauvegarder le contexte de conversation pour l'API
      saveConversationContext(messages.map(msg => ({ text: msg.text, sender: msg.sender })));
    }
    
    // Marquer les nouveaux messages comme vus après animation
    if (messages.some(m => m.isNew)) {
      const timer = setTimeout(() => {
        setMessages(msgs => msgs.map(m => ({ ...m, isNew: false })));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages, saveToLocalStorage]);

  /**
   * Ajouter un message utilisateur
   */
  const addUserMessage = useCallback((text: string, mentionedProducts?: Product[]) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      isNew: true,
      mentionedProducts: mentionedProducts?.length ? mentionedProducts : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    return userMessage;
  }, []);

  /**
   * Ajouter un message bot
   */
  const addBotMessage = useCallback((text: string, mentionedProducts?: Product[], source?: 'google' | 'fallback' | 'cache') => {
    const botMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      isNew: true,
      mentionedProducts: mentionedProducts?.length ? mentionedProducts : undefined,
      source
    };

    setMessages(prev => [...prev, botMessage]);
    return botMessage;
  }, []);

  /**
   * Ajouter un message d'erreur
   */
  const addErrorMessage = useCallback((errorText: string = "Désolé, une erreur s'est produite. Veuillez réessayer plus tard.") => {
    const errorMessage: ChatMessage = {
      id: Date.now().toString(),
      text: errorText,
      sender: 'bot',
      timestamp: new Date(),
      isNew: true
    };

    setMessages(prev => [...prev, errorMessage]);
    return errorMessage;
  }, []);

  /**
   * Réinitialiser la conversation
   */
  const resetConversation = useCallback(() => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      text: initialWelcomeMessage,
      sender: 'bot',
      timestamp: new Date(),
      isNew: true
    };
    
    setMessages([welcomeMessage]);
    
    if (saveToLocalStorage) {
      localStorage.removeItem('chatHistory');
    }
  }, [initialWelcomeMessage, saveToLocalStorage]);

  /**
   * Obtenir l'historique des messages au format attendu par l'API
   */
  const getMessageHistory = useCallback(() => {
    return messages.map(msg => ({ text: msg.text, sender: msg.sender }));
  }, [messages]);

  return {
    messages,
    addUserMessage,
    addBotMessage,
    addErrorMessage,
    resetConversation,
    getMessageHistory
  };
};