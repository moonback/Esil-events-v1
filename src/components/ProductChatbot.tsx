import React, { useState, useRef, useEffect } from 'react';
import { getAllProducts, searchProducts } from '../services/productService';
import { generateChatbotResponse, generateDynamicSuggestions, ChatbotApiType } from '../services/chatbotService';
import { Product } from '../types/Product';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Send, Sparkles, RotateCcw, Search, Tag, X, Package, User, Bot, MessageSquare, Lightbulb, Globe, Settings } from 'lucide-react';
import ProductMiniCard from './ProductMiniCard';
import '../styles/chatbot.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isNew?: boolean;
  isReasoned?: boolean;
  mentionedProducts?: Product[];
  source?: 'google' | 'fallback' | 'cache';
}

interface ProductChatbotProps {
  initialQuestion?: string | null;
}

const ProductChatbot: React.FC<ProductChatbotProps> = ({ initialQuestion = null }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const [showSuggestionsButton, setShowSuggestionsButton] = useState(true);
  const [useReasoningMode, setUseReasoningMode] = useState(false);
  const [apiType, setApiType] = useState<ChatbotApiType>('google');
  const [showSettings, setShowSettings] = useState(false);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [thinkingBudget, setThinkingBudget] = useState<number>(800); // Budget de tokens par défaut
  const [searchAnchor, setSearchAnchor] = useState<string>(''); // Ancrage de recherche
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
            text: "Bonjour ! 👋 Je suis votre assistant virtuel ESIL Events, spécialisé dans la location d'équipements pour vos événements. Je peux vous aider à trouver les produits parfaits pour votre occasion, répondre à vos questions sur nos services, et vous guider dans votre processus de location. Comment puis-je vous assister aujourd'hui ?",
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
  
  // Envoyer la question initiale si elle est fournie
  useEffect(() => {
    if (initialQuestion && !isLoading) {
      // Attendre que les produits soient chargés
      if (products.length > 0) {
        handleSendMessage(initialQuestion);
      }
    }
  }, [initialQuestion, products.length]);

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
  const generateResponse = async (question: string): Promise<{text: string, isReasoned: boolean, source?: 'google' | 'fallback' | 'cache'}> => {
    try {
      // Utiliser le service chatbot pour générer une réponse avec les nouveaux paramètres
      const result = await generateChatbotResponse(
        question, 
        products, 
        useReasoningMode ? thinkingBudget : undefined, // Utiliser le budget de réflexion si le mode raisonnement est activé
        searchAnchor.trim() || undefined // Utiliser l'ancrage de recherche s'il est défini
      );
      
      if (result.error) {
        return {
          text: `Désolé, je ne peux pas répondre pour le moment: ${result.error}`,
          isReasoned: false,
          source: result.source as 'google' | 'fallback' | 'cache' | undefined
        };
      }
      
      return {
        text: result.response || "Désolé, je n'ai pas pu générer une réponse.",
        isReasoned: useReasoningMode,
        source: result.source
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

  // Fonction pour détecter les mentions de produits dans un texte
  const detectProductMentions = (text: string): Product[] => {
    const mentionRegex = /@([\w\s-]+)/g;
    const mentions: string[] = [];
    let match;
    
    // Extraire toutes les mentions de la forme @produitX
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1].trim());
    }
    
    // Trouver les produits correspondants aux mentions
    const mentionedProducts = mentions
      .map(mention => {
        // Rechercher le produit par nom (insensible à la casse)
        return products.find(product => 
          product.name.toLowerCase().includes(mention.toLowerCase()) ||
          mention.toLowerCase().includes(product.name.toLowerCase())
        );
      })
      .filter((product): product is Product => product !== undefined);
    
    return mentionedProducts;
  };
  
  // Fonction pour mettre en évidence les mentions de produits dans le texte
  const highlightProductMentions = (text: string): JSX.Element[] => {
    const mentionRegex = /@([\w\s-]+)/g;
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let match;
    
    // Parcourir toutes les mentions et créer des éléments JSX pour chaque partie du texte
    while ((match = mentionRegex.exec(text)) !== null) {
      // Ajouter le texte avant la mention
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
      }
      
      // Ajouter la mention mise en évidence
      parts.push(
        <span 
          key={`mention-${match.index}`} 
          className="bg-transparent text-white dark:text-violet-300 px-1 rounded font-medium"
        >
          {match[0]}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Ajouter le reste du texte après la dernière mention
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }
    
    return parts;
  };

  // Gérer l'envoi d'un message
  const handleSendMessage = async (text = input) => {
    if (!text.trim()) return;

    // Masquer les suggestions et le bouton après envoi d'un message
    setShowSuggestions(false);
    setShowSuggestionsButton(false);
    setIsSearchingProducts(false);
    setProductSearchResults([]);
    
    // Détecter les produits mentionnés dans le message
    const mentionedProducts = detectProductMentions(text);
    
    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
      isNew: true,
      mentionedProducts: mentionedProducts.length > 0 ? mentionedProducts : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Générer une réponse
      const { text: botResponseText, isReasoned, source } = await generateResponse(text);
      
      // Détecter les produits mentionnés dans la réponse du bot
      const mentionedProducts = detectProductMentions(botResponseText);
      
      // Ajouter la réponse du bot
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
        isNew: true,
        isReasoned,
        mentionedProducts: mentionedProducts.length > 0 ? mentionedProducts : undefined,
        source: source as 'google' | 'fallback' | 'cache' | undefined
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
        isNew: true,
        mentionedProducts: undefined
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
      text: "Bonjour ! 👋 Je suis votre assistant ESIL Events, spécialisé dans la location d'équipements événementiels. Notre catalogue comprend une large gamme de matériel professionnel pour tous types d'événements : mariages, conférences, festivals, soirées privées et bien plus. Je peux vous aider à :\n\n• Trouver les produits parfaits selon vos besoins spécifiques\n• Répondre à vos questions sur nos services et tarifs\n• Vous guider dans le processus de location et réservation\n• Fournir des conseils personnalisés pour votre événement\n\nComment puis-je vous assister aujourd'hui ?",
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
      <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-4 flex justify-between items-center border-b border-violet-300/50 dark:border-violet-600/50 shadow-sm">
        <span className="tracking-wide text-lg font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent font-extrabold">
            ESIL Assistant Pro
          </span>
        </span>
        <div className="flex items-center gap-3">
          <motion.button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-center text-sm bg-gradient-to-r from-violet-500 to-violet-100 dark:from-violet-800 dark:to-violet-900 hover:from-violet-100 hover:to-violet-200 dark:hover:from-violet-700 dark:hover:to-violet-800 text-violet-700 dark:text-violet-200 p-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border border-violet-200 dark:border-violet-700"
            title="Settings"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-5 h-5" />
          </motion.button>
          <motion.button 
            onClick={clearConversation}
            className="flex items-center text-sm bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl transition-all duration-300 group shadow-sm hover:shadow-md"
            title="Clear conversation"
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
              
              {/* Mode raisonnement */}
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">
                Le mode raisonnement utilise DeepSeek Reasoner pour des réponses plus détaillées et analytiques.
              </p>
              
              {/* Budget de réflexion */}
              {/* {useReasoningMode && (
                <div className="flex flex-col gap-2 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Budget de réflexion</span>
                    </div>
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{thinkingBudget} tokens</span>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="2000"
                    step="100"
                    value={thinkingBudget}
                    onChange={(e) => setThinkingBudget(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Plus le budget est élevé, plus les réponses seront détaillées, mais le temps de génération sera plus long.
                  </p>
                </div>
              )} */}
              
              {/* Ancrage de recherche */}
              <div className="flex flex-col gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Ancrage de recherche</span>
                </div>
                <input
                  type="text"
                  value={searchAnchor}
                  onChange={(e) => setSearchAnchor(e.target.value)}
                  placeholder="Ex: mariage, conférence, festival..."
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Orientez les réponses vers un contexte spécifique (type d'événement, besoin particulier...).
                </p>
              </div>
              
              {/* Choix de l'API */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Modèle d'IA à utiliser</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {/* <button
                    onClick={() => setApiType('google' as ChatbotApiType)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${apiType === 'auto' as ChatbotApiType ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    Auto
                  </button> */}
                  <button
                    onClick={() => setApiType('google')}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${apiType === 'google' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    Google
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Auto: utilise l'API disponible avec fallback automatique. Google: utilise uniquement l'API Google Gemini.
                </p>
              </div>
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
                className={`relative max-w-[85%] transition-all transform ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-gray-100 to-gray-100 text-white rounded-2xl rounded-br-none shadow-lg shadow-gray-300/50 dark:shadow-gray-900/40 border border-gray-400/20 backdrop-blur-sm'
                    : message.isReasoned 
                      ? 'bg-gradient-to-br from-gray-100/90 to-gray-200/90 dark:from-gray-800/40 dark:to-gray-700/40 text-gray-800 dark:text-gray-100 border border-gray-300/50 dark:border-gray-600/30 rounded-2xl rounded-tl-none shadow-lg backdrop-blur-sm'
                      : 'bg-gray-100/95 dark:bg-gray-800/95 text-gray-800 dark:text-gray-100 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl rounded-tl-none shadow-lg backdrop-blur-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors'
                } ${message.isNew ? 'message-new scale-100' : 'scale-100'} hover:shadow-xl transition-all duration-300 ease-in-out`}
                whileHover={{ 
                  scale: 1.02,
                  translateY: -2
                }}
                layout
              >
                <div className="p-4">
                  {message.sender === 'bot' && (
                    <div className="flex items-center gap-1 mb-2 pb-2 border-b border-indigo-100 dark:border-indigo-800/30">
                      {message.isReasoned && (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mr-2">Réponse raisonnée</span>
                        </>
                      )}
                      {message.source && (
                        <>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            via {message.source === 'google' ? 'Google Gemini' : message.source === 'cache' ? 'Cache' : 'Fallback'}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  <div className="relative">
                    <div className="text-xs/[1.5] sm:text-sm/[1.6] font-medium prose prose-sm max-w-none dark:prose-invert space-y-1.5 sm:space-y-2.5">
                      {message.text.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line.trim() === '' ? (
                            <div className="h-2 sm:h-4"></div>
                          ) : line.startsWith('• ') || line.startsWith('- ') ? (
                            <div className="flex items-start gap-2 sm:gap-3.5 my-1 sm:my-2 group hover:bg-violet-50/40 dark:hover:bg-violet-900/30 p-1.5 sm:p-2.5 rounded-xl transition-all duration-200 border border-transparent hover:border-violet-100 dark:hover:border-violet-800">
                              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 dark:from-violet-500 dark:to-violet-700 mt-1 sm:mt-1.5 flex-shrink-0 group-hover:scale-110 group-hover:shadow-md transition-all duration-200"></div>
                              <div className="text-gray-700 dark:text-gray-200 leading-relaxed">{line.substring(2)}</div>
                            </div>
                          ) : line.match(/^\d+\.\s/) ? (
                            <div className="flex items-start gap-2 sm:gap-3.5 my-1 sm:my-2 group hover:bg-violet-50/40 dark:hover:bg-violet-900/30 p-1.5 sm:p-2.5 rounded-xl transition-all duration-200 border border-transparent hover:border-violet-100 dark:hover:border-violet-800">
                              <div className="text-xs sm:text-sm font-bold bg-gradient-to-br from-violet-500 to-violet-700 dark:from-violet-400 dark:to-violet-600 bg-clip-text text-transparent mt-0.5 flex-shrink-0 w-4 sm:w-6 text-right group-hover:scale-110 transition-all duration-200">
                                {line.match(/^\d+/)?.[0]}.
                              </div>
                              <div className="text-gray-700 dark:text-gray-200 leading-relaxed">{line.replace(/^\d+\.\s/, '')}</div>
                            </div>
                          ) : (
                            <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{line}</p>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  
                  {/* Afficher les produits mentionnés */}
                  {message.mentionedProducts && message.mentionedProducts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Tag className="w-3.5 h-3.5 text-violet-500" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Produits mentionnés</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {message.mentionedProducts.map(product => (
                          <ProductMiniCard key={product.id} product={product} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
              
              {/* Avatar pour l'utilisateur */}
              {message.sender === 'user' && (
                <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="flex items-end gap-2 mt-4">
            <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25m0 0v2.572a2.25 2.25 0 01-1.5 2.25m0 0c-1.283.918-2.617 1.843-4.5 2.25m0 0c-1.883-.407-3.217-1.332-4.5-2.25m0 0A2.25 2.25 0 013.75 19.5v-2.572a2.25 2.25 0 01.658-1.591L8.5 14.5" />
              </svg>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 sm:p-4 rounded-2xl rounded-tl-none shadow-md">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-violet-400 dark:bg-violet-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-violet-400 dark:bg-violet-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-violet-400 dark:bg-violet-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Élément invisible pour faire défiler vers le bas */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggestions de questions */}
      <AnimatePresence>
        {showSuggestions && showSuggestionsButton && dynamicSuggestions.length > 0 && (
          <motion.div 
            className="p-2 sm:p-3 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Questions suggérées</span>
              </div>
              <button 
                onClick={() => setShowSuggestions(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Fermer les suggestions"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {dynamicSuggestions.map((question, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2.5 sm:px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:border-violet-200 dark:hover:border-violet-700 transition-all duration-200"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {question.length > 40 ? question.substring(0, 40) + '...' : question}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Input Container */}
      <div className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative">
        {/* Résultats de recherche de produits */}
        <AnimatePresence>
          {isSearchingProducts && productSearchResults.length > 0 && (
            <motion.div 
              className="absolute bottom-full left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-t-xl shadow-lg max-h-60 overflow-y-auto z-10"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-2 sm:p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-violet-500" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Produits trouvés</span>
                  </div>
                  <button 
                    onClick={() => setIsSearchingProducts(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {productSearchResults.map(product => (
                    <motion.button
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="w-full text-left p-2 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors flex items-center gap-2"
                      whileHover={{ x: 3 }}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">{product.name}</div>
                        {product.category && (
                          <div className="text-xs text-gray-500">{product.category}</div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Posez votre question ici..."
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-xs sm:text-sm"
              disabled={isLoading}
            />
            {showSuggestionsButton && !showSuggestions && (
              <button 
                onClick={() => setShowSuggestions(true)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
                title="Afficher les suggestions"
              >
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
          <motion.button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white p-2 sm:p-3 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ProductChatbot;