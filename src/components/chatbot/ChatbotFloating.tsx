import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Loader2, Bot, ChevronDown, ChevronUp, Sparkles, Trash2 } from 'lucide-react';
import { sendMessageToChatbot, ChatMessage, ChatOptions } from '../../services/chatbotService';
import { createConversation, saveMessage, getConversationMessages, updateConversationTimestamp, deleteConversation } from '../../services/chatbotStorageService';
import ConversationContext from './ConversationContext';
import { supabase } from '../../services/supabaseClient';

interface ChatbotFloatingProps {
  position?: 'bottom-right' | 'bottom-left';
  initialOpen?: boolean;
}

const STORAGE_KEY = 'esil_events_chatbot_history';

const ChatbotFloating: React.FC<ChatbotFloatingProps> = ({
  position = 'bottom-right',
  initialOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>(`conversation-${Date.now()}`);
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Options du chatbot
  const chatOptions: ChatOptions = {
    tone: 'friendly',
    responseLength: 'concise',
    includeProductData: true // Activer l'accès aux données des produits
  };

  // Initialiser une nouvelle conversation ou charger une conversation existante
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        // Vérifier si l'utilisateur est connecté
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        // Vérifier s'il y a un ID de conversation dans le localStorage
        const savedData = localStorage.getItem(STORAGE_KEY);
        let conversationIdToUse = '';
        
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            conversationIdToUse = parsedData.conversationId;
            
            // Si on a un ID de conversation valide, charger les messages depuis Supabase
            if (conversationIdToUse && conversationIdToUse.length > 10) {
              const messagesFromDB = await getConversationMessages(conversationIdToUse);
              
              if (messagesFromDB && messagesFromDB.length > 0) {
                setMessages(messagesFromDB);
                setConversationId(conversationIdToUse);
                return;
              }
            }
          } catch (e) {
            console.error('Erreur lors du chargement de l\'historique du chat:', e);
            localStorage.removeItem(STORAGE_KEY);
          }
        }
        
        // Si pas d'historique valide, créer une nouvelle conversation
        const newConversationId = await createConversation(userId);
        setConversationId(newConversationId);
        
        // Ajouter un message de bienvenue
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: 'Bonjour ! Je suis l\'assistant virtuel d\'ESIL Events. Comment puis-je vous aider aujourd\'hui ?',
          timestamp: new Date(),
          conversationId: newConversationId
        };
        
        // Sauvegarder le message de bienvenue dans Supabase
        await saveMessage(welcomeMessage);
        setMessages([welcomeMessage]);
        
        // Sauvegarder l'ID de conversation dans le localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversationId: newConversationId }));
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la conversation:', error);
        // Fallback en mode local si Supabase n'est pas disponible
        const localConversationId = `local-${Date.now()}`;
        setConversationId(localConversationId);
        
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: 'Bonjour ! Je suis l\'assistant virtuel d\'ESIL Events. Comment puis-je vous aider aujourd\'hui ?',
          timestamp: new Date(),
          conversationId: localConversationId
        };
        setMessages([welcomeMessage]);
      }
    };
    
    initializeConversation();
  }, []);

  // Faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    scrollToBottom();
    
    // Sauvegarder l'ID de conversation dans localStorage
    if (conversationId) {
      const dataToSave = { conversationId };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [messages, conversationId]);

  // Focus sur l'input lorsque le chat est ouvert
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  const toggleContextExpanded = () => {
    setIsContextExpanded(!isContextExpanded);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputValue.trim() === '' || isLoading) return;

    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      conversationId
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Sauvegarder le message de l'utilisateur dans Supabase
      await saveMessage(userMessage);
      
      // Mettre à jour le timestamp de la conversation
      await updateConversationTimestamp(conversationId);
      
      // Envoyer le message au service de chatbot avec tout l'historique pour maintenir le contexte
      const result = await sendMessageToChatbot([...messages, userMessage], chatOptions);

      if (result.error) {
        setError(result.error);
      } else if (result.response) {
        // Ajouter la réponse du chatbot
        const botMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.response,
          timestamp: new Date(),
          conversationId
        };
        
        // Sauvegarder la réponse du chatbot dans Supabase
        await saveMessage(botMessage);
        
        // Mettre à jour l'interface utilisateur
        setMessages(prev => [...prev, botMessage]);
        
        // Mettre à jour le timestamp de la conversation
        await updateConversationTimestamp(conversationId);
      }
    } catch (err: any) {
      setError('Une erreur est survenue lors de la communication avec le chatbot.');
      console.error('Erreur chatbot:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour effacer l'historique de conversation
  const clearConversation = async () => {
    try {
      // Supprimer l'ancienne conversation de Supabase si elle existe
      if (conversationId && conversationId.length > 10 && !conversationId.startsWith('local-')) {
        await deleteConversation(conversationId);
      }
      
      // Vérifier si l'utilisateur est connecté
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      // Créer une nouvelle conversation dans Supabase
      const newConversationId = await createConversation(userId);
      setConversationId(newConversationId);
      
      // Ajouter un message de bienvenue
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Historique effacé. Comment puis-je vous aider aujourd\'hui ?',
        timestamp: new Date(),
        conversationId: newConversationId
      };
      
      // Sauvegarder le message de bienvenue dans Supabase
      await saveMessage(welcomeMessage);
      
      // Mettre à jour l'interface utilisateur
      setMessages([welcomeMessage]);
      
      // Sauvegarder l'ID de conversation dans le localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversationId: newConversationId }));
    } catch (error) {
      console.error('Erreur lors de la réinitialisation de la conversation:', error);
      
      // Fallback en mode local si Supabase n'est pas disponible
      const localConversationId = `local-${Date.now()}`;
      setConversationId(localConversationId);
      
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Historique effacé. Comment puis-je vous aider aujourd\'hui ?',
        timestamp: new Date(),
        conversationId: localConversationId
      };
      
      setMessages([welcomeMessage]);
    }
  };

  // Variantes d'animation pour le conteneur du chat
  const chatContainerVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20,
      transition: { 
        duration: 0.2 
      }
    }
  };

  // Variantes d'animation pour les messages
  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Variantes d'animation pour le bouton flottant
  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 }
  };

  // Déterminer les classes de position
  const positionClasses = position === 'bottom-right' 
    ? 'bottom-6 right-6' 
    : 'bottom-6 left-6';

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      {/* Bouton flottant pour ouvrir/fermer le chat */}
      <motion.button
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg ${isOpen ? 'bg-red-500' : 'bg-gradient-to-r from-violet-600 to-indigo-600'} text-white focus:outline-none`}
        onClick={toggleChat}
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      {/* Conteneur du chat */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col"
            variants={chatContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
            key="chat-container"
          >
            {/* En-tête du chat */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="mr-2 h-5 w-5" />
                <h3 className="font-medium">Assistant ESIL Events</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={clearConversation}
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label="Effacer la conversation"
                  title="Effacer la conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={toggleChat}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Fermer le chat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Contexte de la conversation */}
            {messages.length > 1 && (
              <ConversationContext 
                messages={messages} 
                isExpanded={isContextExpanded} 
                toggleExpanded={toggleContextExpanded} 
              />
            )}
            
            {/* Corps du chat avec les messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ maxHeight: '350px' }}>
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-white border border-gray-200 text-gray-800'}`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div 
                        className={`text-xs mt-1 ${message.role === 'user' 
                          ? 'text-violet-200' 
                          : 'text-gray-500'}`}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div 
                    key="loading-indicator"
                    className="flex justify-start mb-4"
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                      <span className="text-sm text-gray-600">En train d'écrire...</span>
                    </div>
                  </motion.div>
                )}
                {error && (
                  <motion.div 
                    key="error-message"
                    className="flex justify-center mb-4"
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                      {error}
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </AnimatePresence>
            </div>

            {/* Formulaire de saisie */}
            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 bg-white">
              <div className="flex items-center">
                <input
                  type="text"
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Tapez votre message..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-r-lg transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isLoading || inputValue.trim() === ''}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex items-center justify-center mt-2">
                <div className="text-xs text-gray-500 flex items-center">
                  <Sparkles className="h-3 w-3 mr-1 text-violet-500" />
                  Propulsé par Gemini AI
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatbotFloating;