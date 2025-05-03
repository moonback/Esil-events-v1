import React, { useState, useRef, useEffect } from 'react';
import { getAllProducts } from '../services/productService';
import { generateChatbotResponse } from '../services/chatbotService';
import { Product } from '../types/Product';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isNew?: boolean;
}

const ProductChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
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
  const generateResponse = async (question: string): Promise<string> => {
    try {
      // Utiliser le service chatbot pour générer une réponse
      const result = await generateChatbotResponse(question, products);
      
      if (result.error) {
        return `Désolé, je ne peux pas répondre pour le moment: ${result.error}`;
      }
      
      return result.response || "Désolé, je n'ai pas pu générer une réponse.";
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse:', error);
      return "Désolé, une erreur s'est produite lors de la génération de la réponse. Veuillez réessayer plus tard.";
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
      const botResponse = await generateResponse(text);
      
      // Ajouter la réponse du bot
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        isNew: true
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
    <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white p-5 font-extrabold flex justify-between items-center shadow-md">
        <span className="tracking-wide text-lg flex items-center gap-2">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2"></path>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h-6a2 2 0 00-2 2v3h10V5a2 2 0 00-2-2z"></path>
          </svg>
          ESIL Events Assistant
        </span>
        <button 
          onClick={clearConversation}
          className="text-xs bg-white text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-lg shadow transition-all border border-blue-200"
          title="Effacer la conversation"
        >
          Nouvelle conversation
        </button>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto bg-transparent">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div 
              key={message.id} 
              className={`mb-6 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={message.isNew ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className={`p-4 rounded-2xl shadow-lg max-w-[75%] transition-all ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-400 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}
                initial={message.isNew ? { scale: 0.8 } : { scale: 1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {message.text}
                <div className="text-xs text-gray-400 mt-2 text-right">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            className="text-left mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800 max-w-[80%] shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Questions suggérées */}
        {showSuggestions && messages.length > 0 && !isLoading && (
          <motion.div 
            className="mt-6 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <p className="text-sm text-gray-500 mb-2">Questions fréquentes :</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-5 border-t border-gray-100 bg-white">
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Posez votre question..."
            className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-blue-50 placeholder-gray-400"
            disabled={isLoading}
          />
          <motion.button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-br from-blue-600 to-blue-500 text-white p-3 rounded-xl hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 shadow transition-all"
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ProductChatbot;