import React, { useState, useRef, useEffect } from 'react';
import { getAllProducts, searchProducts } from '../services/productService';
import { generateChatbotResponse, generateDynamicSuggestions } from '../services/chatbotService';
import { Product } from '../types/Product';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Send, Sparkles, RotateCcw, Search, Tag, X, Package, User, Bot, MessageSquare, Lightbulb } from 'lucide-react';
import '../styles/chatbot.css';

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
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const [showSuggestionsButton, setShowSuggestionsButton] = useState(true);
  const [useReasoningMode, setUseReasoningMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Questions fréquentes suggérées

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
      
      // Générer des suggestions dynamiques basées sur les messages et les produits
      const messageHistory = messages.map(msg => ({ text: msg.text, sender: msg.sender }));
      const newSuggestions = generateDynamicSuggestions(products, messageHistory);
      setDynamicSuggestions(newSuggestions);
    }
    
    // Marquer les nouveaux messages comme vus après animation
    if (messages.some(m => m.isNew)) {
      const timer = setTimeout(() => {
        setMessages(msgs => msgs.map(m => ({ ...m, isNew: false })));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages, products]);

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

  // Gérer la recherche de produits avec @
  useEffect(() => {
    if (productSearchQuery.trim()) {
      const searchForProducts = async () => {
        try {
          const results = await searchProducts(productSearchQuery);
          setProductSearchResults(results.slice(0, 5)); // Limiter à 5 résultats pour l'UI
        } catch (error) {
          console.error('Erreur lors de la recherche de produits:', error);
          setProductSearchResults([]);
        }
      };
      
      searchForProducts();
    } else {
      setProductSearchResults([]);
    }
  }, [productSearchQuery]);

  // Gérer les changements dans le champ de saisie
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Mettre à jour la position du curseur
    setCursorPosition(e.target.selectionStart || 0);
    
    // Détecter si l'utilisateur tape @
    const atSymbolIndex = value.lastIndexOf('@', cursorPosition);
    
    if (atSymbolIndex !== -1 && atSymbolIndex < cursorPosition) {
      // Extraire le texte après @ jusqu'à la position du curseur
      const searchText = value.substring(atSymbolIndex + 1, cursorPosition).trim();
      setProductSearchQuery(searchText);
      setIsSearchingProducts(true);
    } else {
      setIsSearchingProducts(false);
      setProductSearchQuery('');
    }
  };

  // Gérer la sélection d'un produit dans les résultats de recherche
  const handleProductSelect = (product: Product) => {
    // Trouver l'index du @ dans l'input
    const atSymbolIndex = input.lastIndexOf('@', cursorPosition);
    
    if (atSymbolIndex !== -1) {
      // Remplacer le texte entre @ et la position du curseur par le nom du produit
      const beforeAt = input.substring(0, atSymbolIndex);
      const afterCursor = input.substring(cursorPosition);
      const newInput = `${beforeAt}@${product.name} ${afterCursor}`;
      
      setInput(newInput);
      // Réinitialiser la recherche
      setIsSearchingProducts(false);
      setProductSearchResults([]);
      
      // Focus sur l'input et placer le curseur après le nom du produit
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const newCursorPosition = beforeAt.length + product.name.length + 2; // +2 pour @ et espace
          inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
          setCursorPosition(newCursorPosition);
        }
      }, 0);
    }
  };

  // Gérer l'envoi d'un message
  const handleSendMessage = async (text = input) => {
    if (!text.trim()) return;

    // Masquer les suggestions et le bouton après envoi d'un message
    setShowSuggestions(false);
    setShowSuggestionsButton(false);
    setIsSearchingProducts(false);
    setProductSearchResults([]);
    
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
      // Réafficher le bouton de suggestions après un délai
      setTimeout(() => setShowSuggestionsButton(true), 1000);
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
      <div className="bg-white text-black p-4 flex justify-between items-center border-b border-violet-300/50 shadow-sm">
        {/* <span className="tracking-wide text-lg font-bold flex items-center gap-3">
          <svg className="w-7 h-7 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="bg-gradient-to-r from-violet-400 to-green-400 bg-clip-text text-transparent">
            Assistant ESIL (Béta)
          </span>
        </span> */}
        <div className="flex items-center gap-3">
          <motion.button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-center text-sm bg-gradient-to-r from-violet-50 to-violet-100 hover:from-violet-100 hover:to-violet-200 text-violet-700 p-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border border-violet-200"
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
            className="flex items-center text-sm bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl transition-all duration-300 group shadow-sm hover:shadow-md"
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
              className={`mb-5 flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Avatar pour le bot */}
              {message.sender === 'bot' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25m0 0v2.572a2.25 2.25 0 01-1.5 2.25m0 0c-1.283.918-2.617 1.843-4.5 2.25m0 0c-1.883-.407-3.217-1.332-4.5-2.25m0 0A2.25 2.25 0 013.75 19.5v-2.572a2.25 2.25 0 01.658-1.591L8.5 14.5" />
                  </svg>
                </div>
              )}
              
              <motion.div 
                className={`relative max-w-[85%] transition-all shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-violet-600 to-violet-500 text-white rounded-2xl rounded-br-none shadow-violet-200 dark:shadow-none'
                    : message.isReasoned 
                      ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-gray-800 dark:text-gray-100 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl rounded-tl-none'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-tl-none'
                } ${message.isNew ? 'message-new' : ''}`}
                whileHover={{ scale: 1.02 }}
                layout
              >
                <div className="p-4">
                  {message.isReasoned && message.sender === 'bot' && (
                    <div className="flex items-center gap-1 mb-2 pb-2 border-b border-indigo-100 dark:border-indigo-800/30">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Réponse raisonnée</span>
                    </div>
                  )}
                  <div className="relative">
                    <p className="text-sm/[1.6] font-medium whitespace-pre-line">
                      {message.text.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line.includes('http') ? (
                            line.split(/\b(https?:\/\/[^\s]+)\b/).map((part, j) => (
                              <React.Fragment key={j}>
                                {part.match(/^https?:\/\//) ? (
                                  <a 
                                    href={part} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={`underline ${message.sender === 'user' ? 'text-indigo-100' : 'text-indigo-500 dark:text-indigo-400'}`}
                                  >
                                    {part}
                                  </a>
                                ) : (
                                  part
                                )}
                              </React.Fragment>
                            ))
                          ) : (
                            line
                          )}
                          {i < message.text.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </p>
                    <div className="text-xs text-gray-400 dark:text-gray-400 mt-2 text-right opacity-70 flex justify-end items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-500"></span>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                
                {/* Decorative corners */}
                {message.sender === 'user' ? (
                  <div className="absolute -right-[2px] bottom-0 w-3 h-3 bg-violet-500 clip-corner" />
                ) : (
                  <div className="absolute -left-[2px] bottom-0 w-3 h-3 bg-white dark:bg-gray-700 clip-corner-left" />
                )}
              </motion.div>
              
              {/* Avatar pour l'utilisateur */}
              {message.sender === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Enhanced Loading Indicator */}
        {isLoading && (
          <motion.div 
            className="flex items-end justify-start mb-5 gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25m0 0v2.572a2.25 2.25 0 01-1.5 2.25m0 0c-1.283.918-2.617 1.843-4.5 2.25m0 0c-1.883-.407-3.217-1.332-4.5-2.25m0 0A2.25 2.25 0 013.75 19.5v-2.572a2.25 2.25 0 01.658-1.591L8.5 14.5" />
              </svg>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-600 relative">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Réflexion en cours...</span>
              </div>
              <div className="absolute -left-[2px] bottom-0 w-3 h-3 bg-white dark:bg-gray-700 clip-corner-left" />
            </div>
          </motion.div>
        )}

        {/* Enhanced Suggested Questions */}
        {showSuggestions && messages.length > 0 && !isLoading && (
          <motion.div 
            className="mt-6 mb-4 px-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                <span>Suggestions :</span>
              </p>
              <motion.button 
                onClick={() => setShowSuggestions(false)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-3 h-3" />
              </motion.button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {dynamicSuggestions.map((question, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-left p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-600 hover:border-violet-200 dark:hover:border-violet-400 flex items-start gap-2"
                  whileHover={{ translateX: 5 }}
                >
                  <MessageSquare className="w-4 h-4 text-violet-500 dark:text-violet-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{question}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bouton flottant pour afficher les suggestions */}
        <AnimatePresence>
          {showSuggestionsButton && !showSuggestions && (
            <motion.button
              onClick={() => setShowSuggestions(true)}
              className="fixed bottom-[150px] right-6 p-3 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Lightbulb className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Area */}
      <div className="p-4 bg-gradient-to-t from-white via-white to-violet-50/30 dark:from-gray-800 dark:via-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="relative w-full">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={useReasoningMode ? "Posez une question (mode raisonnement activé)..." : "Écrivez votre message... (utilisez @ pour mentionner un produit)"}
                className={`w-full p-3 pl-4 pr-10 text-sm bg-white dark:bg-gray-700 border ${useReasoningMode ? 'border-indigo-300 dark:border-indigo-700' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:ring-2 ${useReasoningMode ? 'focus:ring-indigo-400 focus:border-indigo-400' : 'focus:ring-violet-400 focus:border-violet-400'} transition-all placeholder-gray-400 dark:placeholder-gray-500 shadow-sm`}
                disabled={isLoading}
              />
              
              {/* Résultats de recherche de produits */}
              <AnimatePresence>
                {isSearchingProducts && productSearchResults.length > 0 && (
                  <motion.div 
                    className="absolute z-10 bottom-full mb-2 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg rounded-lg overflow-hidden border border-violet-200 dark:border-violet-800"
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 10, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center border-b border-violet-100 dark:border-violet-800 mb-1">
                        <Package className="w-3 h-3 mr-1" />
                        <span>Produits</span>
                      </div>
                      
                      {productSearchResults.map((product) => (
                        <motion.div 
                          key={product.id}
                          className="px-3 py-2 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-md cursor-pointer group transition-all duration-200"
                          onClick={() => handleProductSelect(product)}
                          whileHover={{ x: 3 }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {product.name}
                              </p>
                              {product.category && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {typeof product.category === 'string' 
                                    ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
                                    : product.category[0].charAt(0).toUpperCase() + product.category[0].slice(1)}
                                </p>
                              )}
                            </div>
                            <div className="text-xs font-medium text-violet-600 dark:text-violet-400">
                              {product.priceTTC}€
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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