import React, { useState, useRef, useEffect } from 'react';
import { getAllProducts } from '../services/productService';
import { generateChatbotResponse } from '../services/chatbotService';
import { Product } from '../types/Product';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Send, Sparkles, RotateCcw } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isNew?: boolean;
  isReasoned?: boolean;
}

const ProductChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [useReasoningMode, setUseReasoningMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Questions fréquentes suggérées
  const suggestedQuestions = [
    "Quels sont vos produits les plus populaires pour un mariage ?",
    "Avez-vous des systèmes de sonorisation disponibles ?",
    "Comment fonctionne la livraison du matériel ?",
    "Quels sont vos tarifs pour la location d'éclairage ?"
  ];

  // Charger les produits et l'historique au montage du composant
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await getAllProducts();
        setProducts(productsData);
        
        // Récupérer l'historique des messages du localStorage
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
            text: 'Bonjour ! Je suis votre assistant virtuel ESIL Events. Comment puis-je vous aider avec nos produits de location pour vos événements ?',
            sender: 'bot',
            timestamp: new Date(),
            isNew: true
          }]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
      }
    };

    loadProducts();
    
    // Focus sur l'input au chargement
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  // Faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Sauvegarder l'historique des messages dans localStorage
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
    
    // Marquer les nouveaux messages comme vus après animation
    if (messages.some(m => m.isNew)) {
      const timer = setTimeout(() => {
        setMessages(msgs => msgs.map(m => ({ ...m, isNew: false })));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Fonction pour générer une réponse basée sur la question et les produits disponibles
  const generateResponse = async (question: string): Promise<{text: string, isReasoned: boolean}> => {
    try {
      // Utiliser le service chatbot pour générer une réponse
      const result = await generateChatbotResponse(question, products, useReasoningMode);
      
      if (result.error) {
        return {
          text: `Désolé, je ne peux pas répondre pour le moment: ${result.error}`,
          isReasoned: false
        };
      }
      
      return {
        text: result.response || "Désolé, je n'ai pas pu générer une réponse.",
        isReasoned: useReasoningMode
      };
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse:', error);
      return {
        text: "Désolé, une erreur s'est produite lors de la génération de la réponse. Veuillez réessayer plus tard.",
        isReasoned: false
      };
    }
  };

  // Gérer l'envoi d'un message
  const handleSendMessage = async (text = input) => {
    if (!text.trim()) return;

    // Masquer les suggestions après envoi d'un message
    setShowSuggestions(false);
    
    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
      isNew: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Générer une réponse
      const { text: botResponseText, isReasoned } = await generateResponse(text);
      
      // Ajouter la réponse du bot
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
        isNew: true,
        isReasoned
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      // Message d'erreur
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, une erreur s'est produite. Veuillez réessayer plus tard.",
        sender: 'bot',
        timestamp: new Date(),
        isNew: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Réafficher les suggestions après un délai
      setTimeout(() => setShowSuggestions(true), 2000);
    }
  };
  
  // Gérer le clic sur une question suggérée
  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    handleSendMessage(question);
  };
  
  // Effacer l'historique de conversation
  const clearConversation = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: 'Conversation réinitialisée. Comment puis-je vous aider aujourd\'hui ?',
      sender: 'bot',
      timestamp: new Date(),
      isNew: true
    };
    
    setMessages([welcomeMessage]);
    localStorage.removeItem('chatHistory');
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-white via-violet-50 to-violet-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-violet-900 to-indigo-900 text-white p-4 flex justify-between items-center border-b border-violet-300/50 shadow-sm">
        <span className="tracking-wide text-lg font-bold flex items-center gap-3">
          <svg className="w-7 h-7 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="bg-gradient-to-r from-violet-400 to-green-400 bg-clip-text text-transparent">
            Assistant ESIL
          </span>
        </span>
        <div className="flex items-center gap-2">
          <motion.button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-center text-sm bg-white/10 hover:bg-white/20 text-violet-100 p-2 rounded-lg transition-all duration-300"
            title="Paramètres"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </motion.button>
          <motion.button 
            onClick={clearConversation}
            className="flex items-center text-sm bg-white/10 hover:bg-white/20 text-violet-100 px-4 py-2 rounded-lg transition-all duration-300 group"
            title="Effacer la conversation"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform" />
            Nouvelle discussion
          </motion.button>
        </div>
      </div>
      
      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 border-b border-gray-200 dark:border-gray-700"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Paramètres du chatbot</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Mode raisonnement avancé</span>
                </div>
                <button 
                  onClick={() => setUseReasoningMode(!useReasoningMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${useReasoningMode ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className="sr-only">Activer le mode raisonnement</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useReasoningMode ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Le mode raisonnement utilise DeepSeek Reasoner pour des réponses plus détaillées et analytiques.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-white/50 to-violet-50/30 dark:from-gray-800/80 dark:to-gray-900">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div 
              key={message.id} 
              className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <motion.div 
                className={`relative max-w-[85%] transition-all ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-violet-600 to-violet-500 text-white rounded-2xl rounded-br-none'
                    : message.isReasoned 
                      ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-gray-800 dark:text-gray-100 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl rounded-tl-none'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-tl-none'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-4">
                  {message.isReasoned && message.sender === 'bot' && (
                    <div className="flex items-center gap-1 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Réponse raisonnée</span>
                    </div>
                  )}
                  <p className="text-sm/[1.4] font-medium">{message.text}</p>
                  <div className="text-xs text-gray-300 dark:text-gray-400 mt-2 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {/* Decorative corner */}
                {message.sender === 'user' && (
                  <div className="absolute -right-[2px] bottom-0 w-3 h-3 bg-violet-600 clip-corner" />
                )}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Enhanced Loading Indicator */}
        {isLoading && (
          <motion.div 
            className="flex justify-start mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl shadow-sm flex items-center space-x-2">
              <svg className="h-5 w-5 animate-spin text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm text-gray-500 dark:text-gray-400">Réflexion en cours...</span>
            </div>
          </motion.div>
        )}

        {/* Enhanced Suggested Questions */}
        {showSuggestions && messages.length > 0 && !isLoading && (
          <motion.div 
            className="mt-6 mb-4 px-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Suggestions :</p>
            <div className="grid grid-cols-1 gap-2">
              {suggestedQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-left p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-600 hover:border-violet-200 dark:hover:border-violet-400"
                  whileHover={{ translateX: 5 }}
                >
                  <span className="text-sm text-gray-700 dark:text-gray-200">{question}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Area */}
      <div className="p-4 bg-gradient-to-t from-white via-white to-violet-50/30 dark:from-gray-800 dark:via-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={useReasoningMode ? "Posez une question (mode raisonnement activé)..." : "Écrivez votre message..."}
              className={`w-full p-3 pl-4 pr-10 text-sm bg-white dark:bg-gray-700 border ${useReasoningMode ? 'border-indigo-300 dark:border-indigo-700' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:ring-2 ${useReasoningMode ? 'focus:ring-indigo-400 focus:border-indigo-400' : 'focus:ring-violet-400 focus:border-violet-400'} transition-all placeholder-gray-400 dark:placeholder-gray-500 shadow-sm`}
              disabled={isLoading}
            />
            {useReasoningMode && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Sparkles className="w-4 h-4 text-indigo-500" />
              </div>
            )}
          </div>
          <motion.button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className={`p-3 ${useReasoningMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-violet-600 hover:bg-violet-700'} text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ProductChatbot;