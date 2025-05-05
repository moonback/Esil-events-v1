import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { getAllProducts, searchProducts } from '../services/productService';
import { 
  generateChatbotResponse, 
  generateDynamicSuggestions, 
  ChatbotApiType,
  saveConversationContext,
  getConversationContext,
  optimizeMessageHistory
} from '../services/chatbotService';
import { Product } from '../types/Product';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Send, Sparkles, RotateCcw, Search, Tag, X, Package, User, Bot, MessageSquare, Lightbulb, Globe, Settings } from 'lucide-react';
import ProductMiniCard from './ProductMiniCard';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import '../styles/chatbot.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isNew?: boolean;
  mentionedProducts?: Product[];
  source?: 'google' | 'fallback' | 'cache';
}

// Interface pour les informations contextuelles de l'événement
interface EventContext {
  eventType: string;
  eventDate: string;
  budget: string;
  locationType: string[]; // Types de location: sonorisation, éclairage, jeux arcade, etc. (sélection multiple)
}

interface ProductChatbotProps {
  initialQuestion?: string | null;
  onClose?: () => void;
  onToggleFullScreen?: () => void;
  isFullScreen?: boolean;
}

const ProductChatbot: React.FC<ProductChatbotProps> = ({ initialQuestion = null, onClose, onToggleFullScreen, isFullScreen }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const [showSuggestionsButton, setShowSuggestionsButton] = useState(true);
  const [apiType] = useState<ChatbotApiType>('google');
  const [showSettings, setShowSettings] = useState(false);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [searchAnchor, setSearchAnchor] = useState<string>(''); // Ancrage de recherche
  const [enableCache, setEnableCache] = useState(false); // Add this line
  // États pour le questionnaire contextuel d'événement
  const [showEventQuestionnaire, setShowEventQuestionnaire] = useState(false);
  const [eventContext, setEventContext] = useState<EventContext>({
    eventType: '',
    eventDate: '',
    budget: '',
    locationType: []
  });
  const [eventContextCollected, setEventContextCollected] = useState(false);
  
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
        
        // Récupérer le contexte d'événement du localStorage
        const savedEventContext = localStorage.getItem('eventContext');
        if (savedEventContext) {
          const parsedEventContext = JSON.parse(savedEventContext);
          setEventContext(parsedEventContext);
          setEventContextCollected(true);
          setSearchAnchor(parsedEventContext.eventType); // Utiliser le type d'événement comme ancrage
        }
        
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
            text: "Bienvenue chez ESIL Events. Je suis votre conseiller expert en solutions événementielles, spécialisé dans l'accompagnement et la location d'équipements professionnels. Pour vous proposer une sélection adaptée à vos besoins spécifiques, j'aurais besoin de quelques informations essentielles concernant votre projet de lacation ou de recherche de prestataire : la nature de votre événement, la date envisagée, ainsi que votre budget prévisionnel. Comment puis-je vous accompagner aujourd'hui ?",
            sender: 'bot',
            timestamp: new Date(),
            isNew: true
          }]);
           
          // Afficher le questionnaire contextuel seulement si le contexte n'a pas déjà été collecté
          if (!savedEventContext) {
            setShowEventQuestionnaire(true);
          }
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
  const generateResponse = async (question: string): Promise<{text: string, source?: 'google' | 'fallback' | 'cache'}> => {
    try {
      // Construire un ancrage de recherche enrichi avec le contexte de l'événement si disponible
      let enrichedAnchor = searchAnchor.trim();
      let enhancedQuestion = question;
      
      // Détecter si la question est une demande de comparaison
      const { isComparison, productNames } = detectComparisonRequest(question);
      
      // Si c'est une demande de comparaison avec au moins 2 produits identifiés
      if (isComparison && productNames.length >= 2) {
        // Trouver les produits complets à partir des noms
        const productsToCompare = productNames
          .map(name => products.find(p => p.name.toLowerCase() === name.toLowerCase()))
          .filter((p): p is Product => p !== undefined);
        
        // Si on a trouvé au moins 2 produits à comparer
        if (productsToCompare.length >= 2) {
          // Ajouter une instruction spécifique pour la comparaison
          const comparisonInstruction = `
[INSTRUCTION SPÉCIALE: COMPARAISON DE PRODUITS]
Veuillez présenter une comparaison détaillée sous forme de tableau entre les produits suivants: ${productsToCompare.map(p => p.name).join(', ')}.

Incluez dans votre comparaison:
1. Prix TTC
2. Caractéristiques techniques principales
3. Avantages et inconvénients
4. Cas d'usage recommandés
5. Disponibilité

Présentez cette comparaison sous forme de tableau markdown pour une meilleure lisibilité.
`;
          
          enhancedQuestion = `${comparisonInstruction}\n\nQuestion originale: ${question}`;
          
          // Utiliser le service chatbot avec les paramètres spécifiques pour la comparaison
          const result = await generateChatbotResponse(
            enhancedQuestion,
            products,
            messages.map(msg => ({ text: msg.text, sender: msg.sender })),
            1200, // Valeur fixe pour les comparaisons
            enrichedAnchor || undefined,
            enableCache
        );
          
          if (result.error) {
            return {
              text: `Désolé, je ne peux pas générer la comparaison pour le moment: ${result.error}`,
              source: result.source as 'google' | 'fallback' | 'cache' | undefined
            };
          }
          
          return {
            text: result.response || "Désolé, je n'ai pas pu générer la comparaison demandée.",
            source: result.source
          };
        }
      }
      
      // Si le contexte d'événement a été collecté, l'utiliser pour enrichir l'ancrage
      if (eventContextCollected) {
        // Utiliser le type d'événement comme base si l'ancrage est vide
        if (!enrichedAnchor && eventContext.eventType) {
          enrichedAnchor = eventContext.eventType;
        }
        
        // Ajouter des informations contextuelles à la question
        const contextualInfo = `Contexte: ${eventContext.eventType}, date: ${eventContext.eventDate}, budget: ${eventContext.budget}, type de location: ${eventContext.locationType}`;
        enhancedQuestion = `${contextualInfo}\n\nQuestion: ${question}`;
      }
      
      // Utiliser le service chatbot pour générer une réponse avec les nouveaux paramètres
      const result = await generateChatbotResponse(
        enhancedQuestion, 
        products,
        messages.map(msg => ({ text: msg.text, sender: msg.sender })),
        undefined,
        enrichedAnchor || undefined,
        enableCache
    );
      
      if (result.error) {
        return {
          text: `Désolé, je ne peux pas répondre pour le moment: ${result.error}`,
          source: result.source as 'google' | 'fallback' | 'cache' | undefined
        };
      }
      
      return {
        text: result.response || "Désolé, je n'ai pas pu générer une réponse.",
        source: result.source
      };
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse:', error);
      return {
        text: "Désolé, une erreur s'est produite lors de la génération de la réponse. Veuillez réessayer plus tard."
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
  const detectProductMentions = useCallback((text: string): Product[] => {
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
  }, [products]);
  
  // Fonction pour détecter si l'utilisateur demande une comparaison de produits
  const detectComparisonRequest = useCallback((text: string): { isComparison: boolean, productNames: string[] } => {
    // Expressions régulières pour détecter les demandes de comparaison
    const comparisonRegex = /compar(e[rz]?|aison|atif)|versus|vs\.?|différence entre|quel(?:le)? est (?:la|le) meilleur(?:e)?/i;
    
    // Vérifier si le texte contient une demande de comparaison
    const isComparison = comparisonRegex.test(text);
    
    if (!isComparison) {
      return { isComparison: false, productNames: [] };
    }
    
    // Extraire les noms de produits mentionnés
    // 1. Chercher les mentions explicites avec @
    const mentionedProducts = detectProductMentions(text);
    const mentionedNames = mentionedProducts.map(p => p.name);
    
    // 2. Si moins de 2 produits sont mentionnés avec @, chercher des noms de produits dans le texte
    if (mentionedNames.length < 2) {
      // Chercher tous les produits dont le nom apparaît dans le texte
      const textLower = text.toLowerCase();
      const potentialProducts = products.filter(product => 
        textLower.includes(product.name.toLowerCase())
      );
      
      // Ajouter les produits trouvés qui ne sont pas déjà dans la liste
      potentialProducts.forEach(product => {
        if (!mentionedNames.includes(product.name)) {
          mentionedNames.push(product.name);
        }
      });
    }
    
    return { 
      isComparison: true, 
      productNames: mentionedNames
    };
  }, [products, detectProductMentions]);
    
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

    // Mettre à jour les messages avec le message de l'utilisateur
  const updatedMessages = [...messages, userMessage];
  setMessages(updatedMessages);
  
  // Sauvegarder le contexte de conversation après l'ajout du message utilisateur
  saveConversationContext(updatedMessages.map(msg => ({ text: msg.text, sender: msg.sender })));
  
  setInput('');
  setIsLoading(true);

  try {
    // Générer une réponse
    const { text: botResponseText, source } = await generateResponse(text);
    
    // Détecter les produits mentionnés dans la réponse du bot
    const mentionedProducts = detectProductMentions(botResponseText);
    
    // Ajouter la réponse du bot
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponseText,
      sender: 'bot',
      timestamp: new Date(),
      isNew: true,
      mentionedProducts: mentionedProducts.length > 0 ? mentionedProducts : undefined,
      source: source as 'google' | 'fallback' | 'cache' | undefined
    };

    // Mettre à jour les messages avec la réponse du bot
    const messagesWithBotResponse = [...updatedMessages, botMessage];
    setMessages(messagesWithBotResponse);
    
    // Sauvegarder le contexte de conversation après l'ajout de la réponse du bot
    saveConversationContext(messagesWithBotResponse.map(msg => ({ text: msg.text, sender: msg.sender })));
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

    // Mettre à jour les messages avec le message d'erreur
    const messagesWithError = [...updatedMessages, errorMessage];
    setMessages(messagesWithError);
    
    // Sauvegarder le contexte même en cas d'erreur
    saveConversationContext(messagesWithError.map(msg => ({ text: msg.text, sender: msg.sender })));
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
  
  // Gérer la soumission du questionnaire contextuel
  const handleEventContextSubmit = () => {
    // Vérifier si tous les champs sont remplis
    if (!eventContext.eventType || !eventContext.eventDate || !eventContext.budget || !eventContext.locationType) {
      return; // Ne pas soumettre si des champs sont vides
    }
    
    // Marquer le contexte comme collecté
    setEventContextCollected(true);
    setShowEventQuestionnaire(false);
    
    // Mettre à jour l'ancrage de recherche avec le type d'événement
    setSearchAnchor(eventContext.eventType);
    
    // Ajouter un message de confirmation
    const confirmationMessage: Message = {
      id: Date.now().toString(),
      text: `Merci pour ces informations ! Je vais adapter mes recommandations pour votre ${eventContext.eventType} prévu le ${eventContext.eventDate} avec un budget d'environ ${eventContext.budget} et un besoin en ${eventContext.locationType}. Comment puis-je vous aider maintenant ?`,
      sender: 'bot',
      timestamp: new Date(),
      isNew: true
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
    
    // Sauvegarder le contexte dans localStorage
    localStorage.setItem('eventContext', JSON.stringify(eventContext));
  };
  
  // Effacer l'historique de conversation
  const clearConversation = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: "Bienvenue chez ESIL Events ! 👋 Je suis votre conseiller expert dédié à la réussite de vos événements/location. Notre expertise en location d'équipements professionnels nous permet de vous accompagner dans tous vos projets. Pour vous proposer une sélection parfaitement adaptée à vos besoins, j'aurais besoin de quelques informations essentielles : quel type d'événement organisez-vous ? À quelle date est-il prévu ? Quel budget avez-vous envisagé ? Je suis là pour vous guider vers les meilleures solutions.",
      sender: 'bot',
      timestamp: new Date(),
      isNew: true
    };
    
    setMessages([welcomeMessage]);
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('eventContext');
    
    // Réinitialiser le contexte d'événement
    setEventContext({
      eventType: '',
      eventDate: '',
      budget: '',
      locationType: []
    });
    setEventContextCollected(false);
    setShowEventQuestionnaire(true);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-white via-violet-50 to-violet-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      {/* Combined Header */}
      <div className="bg-gradient-to-r from-white to-violet-50 dark:from-gray-800 dark:to-gray-900 text-black dark:text-white p-3 flex justify-between items-center border-b border-violet-200 dark:border-violet-800 shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-400 to-violet-700 flex items-center justify-center shadow-md transform hover:rotate-3 transition-all duration-300 ring-2 ring-violet-200 dark:ring-violet-900">
            <span className="text-white text-sm font-bold">CHAT</span>
          </div>
          <div className="flex flex-col">
            <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-violet-700 bg-clip-text text-transparent font-bold text-base">
              ESIL Assistant
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">AI Assistant</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-violet-700 dark:text-violet-200 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/50 transition-all duration-200"
            title="Settings"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-4 h-4" />
          </motion.button>
          <motion.button 
            onClick={clearConversation}
            className="flex items-center gap-1 text-sm bg-violet-500 hover:bg-violet-600 text-white px-3 py-2 rounded-lg transition-all duration-200"
            title="New conversation"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Nouveau</span>
          </motion.button>
          {onToggleFullScreen && (
            <motion.button
              className="p-2 text-violet-500 hover:text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/50 rounded-lg transition-all duration-200"
              onClick={onToggleFullScreen}
              aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isFullScreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              )}
            </motion.button>
          )}
          {onClose && (
            <motion.button
              className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-all duration-200"
              onClick={onClose}
              aria-label="Close chatbot"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={16} />
            </motion.button>
          )}
        </div>
      </div>
      
      {/* Event Context Questionnaire */}
      <AnimatePresence>
        {showEventQuestionnaire && (
          <motion.div 
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 border-b border-gray-200 dark:border-gray-700 shadow-lg"
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex flex-col gap-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
                    Informations pour votre futur location
                  </h3>
                </div>
                <motion.button
                  onClick={() => setShowEventQuestionnaire(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Fermer le questionnaire"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
              </div>
              
              <div className="p-4 bg-violet-50/50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-800/50">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Pour vous aider à choisir le matériel adapté à votre événement, nous avons besoin de quelques informations sur vos besoins en location.
                </p>
                
                {/* Type d'événement */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type d'événement organisé
                  </label>
                  <select
                    value={eventContext.eventType}
                    onChange={(e) => setEventContext({...eventContext, eventType: e.target.value})}
                    className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-violet-200 dark:border-violet-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionnez un type d'événement</option>
                    <option value="Mariage">Mariage</option>
                    <option value="Conférence">Conférence</option>
                    <option value="Concert">Concert</option>
                    <option value="Festival">Festival</option>
                    <option value="Séminaire d'entreprise">Séminaire d'entreprise</option>
                    <option value="Salon professionnel">Salon professionnel</option>
                    <option value="Anniversaire">Anniversaire</option>
                    <option value="Soirée privée">Soirée privée</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                
                {/* Date de l'événement */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de location prévue
                  </label>
                  <input
                    type="date"
                    value={eventContext.eventDate}
                    onChange={(e) => setEventContext({...eventContext, eventDate: e.target.value})}
                    className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-violet-200 dark:border-violet-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                {/* Budget */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget approximatif
                  </label>
                  <select
                    value={eventContext.budget}
                    onChange={(e) => setEventContext({...eventContext, budget: e.target.value})}
                    className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-violet-200 dark:border-violet-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionnez une fourchette de budget</option>
                    <option value="Moins de 500€">Moins de 500€</option>
                    <option value="500€ - 1000€">500€ - 1000€</option>
                    <option value="1000€ - 3000€">1000€ - 3000€</option>
                    <option value="3000€ - 5000€">3000€ - 5000€</option>
                    <option value="5000€ - 10000€">5000€ - 10000€</option>
                    <option value="Plus de 10000€">Plus de 10000€</option>
                  </select>
                </div>
                
                {/* Type de location */}
<div className="mb-6">
  <div className="flex items-center gap-2 mb-3">
    <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
      <Package className="w-4 h-4 text-violet-600 dark:text-violet-400" />
    </div>
    <label className="text-sm font-medium bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
      Mes besoins en location
    </label>
  </div>
  
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
    {[
      "Sonorisation",
      "Éclairage",
      "Jeux arcade",
      "Mobilier",
      "Décoration",
      "Vidéoprojection",
      "Scène",
      "Autre"
    ].map((option) => (
      <motion.button
        key={option}
        onClick={() => {
          const newTypes = eventContext.locationType.includes(option)
            ? eventContext.locationType.filter(type => type !== option)
            : [...eventContext.locationType, option];
          setEventContext({...eventContext, locationType: newTypes});
        }}
        className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
          eventContext.locationType.includes(option)
            ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-700'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
          eventContext.locationType.includes(option)
            ? 'border-white bg-white/20'
            : 'border-gray-400 dark:border-gray-600'
        }`}>
          {eventContext.locationType.includes(option) && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          )}
        </div>
        {option}
      </motion.button>
    ))}
  </div>
</div>
                
                <div className="flex justify-between mt-4">
                  <motion.button
                    onClick={() => setShowEventQuestionnaire(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Ignorer</span>
                    <X className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    onClick={handleEventContextSubmit}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${!eventContext.eventType || !eventContext.eventDate || !eventContext.budget || !eventContext.locationType ? 'bg-gray-400 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700'}`}
                    whileHover={{ scale: !eventContext.eventType || !eventContext.eventDate || !eventContext.budget || !eventContext.locationType ? 1 : 1.05 }}
                    whileTap={{ scale: !eventContext.eventType || !eventContext.eventDate || !eventContext.budget || !eventContext.locationType ? 1 : 0.95 }}
                    disabled={!eventContext.eventType || !eventContext.eventDate || !eventContext.budget || !eventContext.locationType}
                  >
                    <span>Continuer</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 border-b border-gray-200 dark:border-gray-700 shadow-lg"
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex flex-col gap-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                  <Settings className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
                  Paramètres du chatbot
                </h3>
              </div>
              

              {/* Le mode raisonnement avancé a été retiré */}
              
              {/* Informations sur l'événement */}
              <div className="p-4 bg-violet-50/50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-800/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Informations sur votre location</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {eventContextCollected ? (
                          <span className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Type d'événement:</span> {eventContext.eventType} |{' '}
                            <span className="font-medium">Date:</span> {eventContext.eventDate} |{' '}
                            <span className="font-medium">Budget:</span> {eventContext.budget} |{' '}
                            <span className="font-medium">Équipements:</span> {eventContext.locationType.join(', ')}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic">
                            Aucune information contextuelle spécifiée
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setShowEventQuestionnaire(!showEventQuestionnaire);
                      setShowSettings(false); // Fermer le panneau de réglages
                    }}
                    className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 underline"
                  >
                    {eventContextCollected ? "Modifier" : "Spécifier"}
                  </button>
                </div>
              </div>
<div className="p-4 bg-violet-50/50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-800/50">
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>
                </svg>
            </div>
            <div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Cache des réponses</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {enableCache ? 'Activé - Utilise les réponses en cache' : 'Désactivé - Requêtes fraîches uniquement'}
                </p>
            </div>
        </div>
        <button 
            onClick={() => setEnableCache(!enableCache)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 ${enableCache ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
            <span className="sr-only">Toggle cache</span>
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${enableCache ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
</div>

              {/* Ancrage de recherche */}
              {/* <div className="p-4 bg-violet-50/50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                    <Search className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Contexte de la conversation</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Orientez les réponses vers un contexte spécifique
                    </p>
                  </div>
                </div>
                <input
                  type="text"
                  value={searchAnchor}
                  onChange={(e) => setSearchAnchor(e.target.value)}
                  placeholder="Ex: mariage, conférence, festival..."
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-violet-200 dark:border-violet-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div> */}
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
                    : 'bg-gray-100/95 dark:bg-gray-800/95 text-gray-800 dark:text-gray-100 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl rounded-tl-none shadow-lg backdrop-blur-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors'
                } ${message.isNew ? 'message-new scale-100' : 'scale-100'} hover:shadow-xl transition-all duration-300 ease-in-out`}
                whileHover={{ 
                  scale: 1.02,
                  translateY: -2
                }}
                layout
              >
                <div className="p-4">
                  {message.sender === 'bot' && message.source && (
                    <div className="flex items-center gap-1 mb-2 pb-2 border-b border-indigo-100 dark:border-indigo-800/30">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        via {message.source === 'google' ? 'Google Gemini' : message.source === 'cache' ? 'Cache' : 'Fallback'}
                      </span>
                    </div>
                  )}
                  <div className="relative">
                    <div className="text-xs/[1.5] sm:text-sm/[1.6] font-medium prose prose-sm max-w-none dark:prose-invert space-y-1.5 sm:space-y-2.5 markdown-content">
                      <ReactMarkdown 
                        rehypePlugins={[rehypeSanitize]}
                        components={{
                          // Personnalisation des titres
                          h1: ({node, ...props}: {node?: any, [key: string]: any}) => <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 my-3 pb-2 border-b border-gray-200 dark:border-gray-700" {...props} />,
                          h2: ({node, ...props}: {node?: any, [key: string]: any}) => <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 my-2.5" {...props} />,
                          h3: ({node, ...props}: {node?: any, [key: string]: any}) => <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 my-2" {...props} />,
                          h4: ({node, ...props}: {node?: any, [key: string]: any}) => <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 my-1.5" {...props} />,
                          
                          // Personnalisation des paragraphes
                          p: ({node, ...props}: {node?: any, [key: string]: any}) => <p className="text-gray-700 dark:text-gray-200 leading-relaxed my-2" {...props} />,
                          
                          // Personnalisation des listes
                          // Personnalisation des listes
                          ul: ({node, ...props}: {node?: any, [key: string]: any}) => <ul className="my-2 space-y-1 list-none pl-0" {...props} />,
                          ol: ({node, ...props}: {node?: any, [key: string]: any}) => <ol className="my-2 space-y-1 list-none pl-1" {...props} />,
                          li: ({node, children, ...props}: {node?: any, children?: React.ReactNode, [key: string]: any}) => {
                            const parentType = node?.parent?.type;
                            if (parentType === 'ul') {
                              return (
<li className="flex items-start gap-3 sm:gap-4 my-2 group hover:bg-gradient-to-r hover:from-violet-50/30 hover:to-violet-100/30 dark:hover:from-violet-900/20 dark:hover:to-violet-800/20 p-3 rounded-2xl transition-all duration-300 ease-in-out border border-transparent hover:border-violet-200/50 dark:hover:border-violet-700/50 hover:shadow-lg hover:shadow-violet-100/20 dark:hover:shadow-violet-900/20" {...props}>
  <div className="relative mt-1">
    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-br from-violet-400 via-violet-500 to-violet-600 dark:from-violet-500 dark:via-violet-600 dark:to-violet-700 flex-shrink-0 group-hover:scale-125 group-hover:rotate-180 group-hover:shadow-xl group-hover:shadow-violet-400/30 dark:group-hover:shadow-violet-700/30 transition-all duration-500 ease-spring"></div>
    <div className="absolute -inset-2 bg-violet-400/20 dark:bg-violet-600/20 rounded-full blur-md opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300 -z-10"></div>
  </div>
  <span className="text-gray-700 dark:text-gray-200 flex-1 group-hover:translate-x-1 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-all duration-300">{children}</span>
</li>
                              );
                            } else {
                              return (
                              <li className="flex items-start gap-2 sm:gap-3 my-1.5 group hover:bg-gradient-to-r hover:from-violet-50/30 hover:to-violet-100/30 dark:hover:from-violet-900/20 dark:hover:to-violet-800/20 p-2 rounded-xl transition-all duration-300 ease-in-out border border-transparent hover:border-violet-200/50 dark:hover:border-violet-700/50 hover:shadow-lg hover:shadow-violet-100/20 dark:hover:shadow-violet-900/20" {...props}>
                                <div className="relative">
                                  <div className="text-xs sm:text-sm font-bold bg-gradient-to-br from-violet-500 to-violet-700 dark:from-violet-400 dark:to-violet-600 bg-clip-text text-transparent flex-shrink-0 w-5 text-right group-hover:scale-110 transition-all duration-300">
                                    {(props as any).index + 1 || '•'}
                                  </div>
                                  <div className="absolute -inset-2 bg-violet-400/10 dark:bg-violet-600/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                                </div>
                                <span className="text-gray-700 dark:text-gray-200 flex-1 group-hover:translate-x-1 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-all duration-300">{children}</span>
                              </li>
                              );
                            }
                          },
                          
                          // Personnalisation des tableaux
                          table: ({node, ...props}: {node?: any, [key: string]: any}) => (
                            <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
                              <table className="w-full border-collapse" {...props} />
                            </div>
                          ),
                          thead: ({node, ...props}: {node?: any, [key: string]: any}) => <thead className="bg-gray-50 dark:bg-gray-800" {...props} />,
                          tbody: ({node, ...props}: {node?: any, [key: string]: any}) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props} />,
                          tr: ({node, ...props}: {node?: any, [key: string]: any}) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors" {...props} />,
                          th: ({node, ...props}: {node?: any, [key: string]: any}) => <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-800" {...props} />,
                          td: ({node, ...props}: {node?: any, [key: string]: any}) => <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700" {...props} />,
                          
                          // Personnalisation des liens
                          a: ({node, ...props}: {node?: any, [key: string]: any}) => <a className="text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                          
                          // Personnalisation du code
                          code: ({node, inline, ...props}: {node?: any, inline?: boolean, [key: string]: any}) => {
                            if (inline) {
                              return <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-violet-600 dark:text-violet-400 text-xs font-mono" {...props} />;
                            }
                            return <code className="block p-3 rounded-lg bg-gray-100 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 text-xs font-mono overflow-x-auto" {...props} />;
                          },
                          pre: ({node, ...props}: {node?: any, [key: string]: any}) => <pre className="my-3 rounded-lg bg-gray-100 dark:bg-gray-800/80 overflow-hidden" {...props} />,
                          
                          // Personnalisation des citations
                          blockquote: ({node, ...props}: {node?: any, [key: string]: any}) => <blockquote className="pl-4 border-l-4 border-violet-300 dark:border-violet-700 italic text-gray-600 dark:text-gray-300 my-3" {...props} />,
                          
                          // Personnalisation des séparateurs
                          hr: ({node, ...props}: {node?: any, [key: string]: any}) => <hr className="my-4 border-t border-gray-200 dark:border-gray-700" {...props} />,
                          
                          // Personnalisation des images
                          img: ({node, ...props}: {node?: any, [key: string]: any}) => <img className="max-w-full h-auto rounded-lg my-3 border border-gray-200 dark:border-gray-700" {...props} alt={props.alt || 'Image'} />,
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                  
                  {/* Afficher les produits mentionnés */}
                  {message.mentionedProducts && message.mentionedProducts.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1 bg-violet-50 dark:bg-violet-900/30 rounded-full">
                          <Tag className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                          Produits mentionnés
                        </span>
                      </div>
                      <motion.div 
                        className="flex flex-wrap gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {message.mentionedProducts.map(product => (
                          <motion.div
                            key={product.id}
                            whileHover={{ scale: 1.02, y: -2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ProductMiniCard product={product} />
                          </motion.div>
                        ))}
                      </motion.div>
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
      
      {/* Suggestions de questions améliorées */}
      <AnimatePresence>
        {showSuggestions && showSuggestionsButton && dynamicSuggestions.length > 0 && (
          <motion.div 
            className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white/95 to-violet-50/95 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-md shadow-inner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-700/30 dark:to-amber-900/30 rounded-lg shadow-sm">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                </div>
                <span className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-600 dark:from-gray-200 dark:to-gray-300 bg-clip-text text-transparent">
                  Questions suggérées
                </span>
              </div>
              <motion.button 
                onClick={() => setShowSuggestions(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full"
                aria-label="Fermer les suggestions"
                whileHover={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dynamicSuggestions.map((question, index) => {
                // Déterminer l'icône en fonction du contenu de la question
                let icon = <MessageSquare className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />;
                
                if (question.toLowerCase().includes('prix') || question.toLowerCase().includes('tarif') || question.toLowerCase().includes('coût') || question.toLowerCase().includes('€')) {
                  icon = <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 dark:text-emerald-400"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>;
                } else if (question.toLowerCase().includes('livraison') || question.toLowerCase().includes('délai') || question.toLowerCase().includes('disponible')) {
                  icon = <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 dark:text-blue-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
                } else if (question.toLowerCase().includes('catégorie') || question.toLowerCase().includes('produit')) {
                  icon = <Package className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />;
                } else if (question.toLowerCase().includes('événement') || question.toLowerCase().includes('mariage') || question.toLowerCase().includes('conférence')) {
                  icon = <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500 dark:text-pink-400"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2"/><path d="M18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M18 21a6 6 0 0 0-6-6h-3"/></svg>;
                }
                
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="flex items-center gap-2 text-left text-xs sm:text-sm bg-white dark:bg-gray-700/70 text-gray-700 dark:text-gray-200 p-2.5 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-600/50 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 dark:hover:from-violet-900/30 dark:hover:to-indigo-900/30 hover:border-violet-200 dark:hover:border-violet-700/70 transition-all duration-200 group"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors duration-200 flex-shrink-0">
                      {icon}
                    </div>
                    <span className="line-clamp-2">
                      {question}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Input Container */}
      <div className="p-3 border-t bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative">
        {/* Bouton flottant pour les suggestions */}
        {!showSuggestions && showSuggestionsButton && dynamicSuggestions.length > 0 && (
          <motion.button
            onClick={() => setShowSuggestions(true)}
            className="absolute -top-12 right-3 bg-gradient-to-r from-violet-500 to-violet-600 text-white p-2 rounded-full shadow-lg z-10 flex items-center gap-2 pr-3 border border-violet-400 dark:border-violet-700 hover:shadow-violet-200 dark:hover:shadow-violet-900/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Lightbulb className="w-4 h-4" />
            <span className="text-xs font-medium">Suggestions</span>
          </motion.button>
        )}
        {/* Résultats de recherche de produits */}
        <AnimatePresence>
          {isSearchingProducts && productSearchResults.length > 0 && (
            <motion.div 
              className="absolute bottom-full left-0 w-full bg-white/95 dark:bg-gray-800/95 border-t rounded-t-xl shadow-lg max-h-60 overflow-y-auto z-10"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-violet-500" />
                    <span className="text-sm font-medium text-violet-600">Suggestions</span>
                  </div>
                  <motion.button 
                    onClick={() => setIsSearchingProducts(false)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    whileHover={{ rotate: 90 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
                <div className="space-y-1">
                  {productSearchResults.map(product => (
                    <motion.button
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="w-full p-2 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg flex items-center gap-2 group"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-violet-500" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">{product.name}</div>
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
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="relative group">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Posez votre question... Utilisez @ pour mentionner un produit"
                className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-violet-500/50 text-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-all duration-200 group-hover:border-violet-200 dark:group-hover:border-violet-700/50 group-hover:shadow-md"
                disabled={isLoading}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* <span className="hidden sm:inline">Utilisez </span>@ pour mentionner un produit */}
              </div>
            </div>
            {showSuggestionsButton && !showSuggestions && (
              <motion.button 
                onClick={() => setShowSuggestions(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-full transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Lightbulb className="w-4 h-4" />
              </motion.button>
            )}
          </div>
          <motion.button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="bg-violet-600 text-white p-2.5 rounded-xl disabled:opacity-50"
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