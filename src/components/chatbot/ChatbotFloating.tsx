import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Loader2, Bot, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { sendMessageToChatbot, ChatMessage, ChatOptions } from '../../services/chatbotService';

interface ChatbotFloatingProps {
  position?: 'bottom-right' | 'bottom-left';
  initialOpen?: boolean;
}

const ChatbotFloating: React.FC<ChatbotFloatingProps> = ({
  position = 'bottom-right',
  initialOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Options du chatbot
  const chatOptions: ChatOptions = {
    tone: 'friendly',
    responseLength: 'concise'
  };

  // Ajouter un message de bienvenue au chargement
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: 'Bonjour ! Je suis l\'assistant virtuel d\'ESIL Events. Comment puis-je vous aider aujourd\'hui ?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Envoyer le message au service de chatbot
      const result = await sendMessageToChatbot([...messages, userMessage], chatOptions);

      if (result.error) {
        setError(result.error);
      } else if (result.response) {
        // Ajouter la réponse du chatbot
        const botMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (err: any) {
      setError('Une erreur est survenue lors de la communication avec le chatbot.');
      console.error('Erreur chatbot:', err);
    } finally {
      setIsLoading(false);
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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col"
            variants={chatContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            {/* En-tête du chat */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="mr-2 h-5 w-5" />
                <h3 className="font-medium">Assistant ESIL Events</h3>
              </div>
              <button 
                onClick={toggleChat}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Fermer le chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

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