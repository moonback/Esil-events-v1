import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, HelpCircle, Tag, RefreshCw } from 'lucide-react';
import { generateChatbotResponse, ChatMessage, saveChatSession, loadChatSession, handleQuoteRequestViaChatbot } from '../services/chatbotService';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/chatbot.css';
import useDebounce from '../hooks/useDebounce';
import { getProductSuggestions, ProductSuggestion } from '../services/productSuggestionService';

const ChatbotWidget: React.FC = () => {
  // État pour gérer l'ouverture/fermeture du chatbot
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // États pour la fonctionnalité de suggestion de produits avec @
  const [productQuery, setProductQuery] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState<ProductSuggestion[]>([]);
  const [productSuggestionsLoading, setProductSuggestionsLoading] = useState(false);
  const [mentionPosition, setMentionPosition] = useState<{start: number, end: number} | null>(null);
  
  // Debounce la requête de produit pour éviter trop d'appels API
  const debouncedProductQuery = useDebounce(productQuery, 300);
  
  // Suggestions de questions pour guider l'utilisateur
  const questionSuggestions = [
    "Quels types d'événements proposez-vous ?",
    "Comment fonctionne la location de matériel ?",
    "Quels sont vos délais de livraison ?",
    "Puis-je obtenir un devis personnalisé ?",
    "Quelles sont vos options de personnalisation ?",
    "Comment annuler ou modifier ma commande ?"
  ];
  
  // Fonction pour réafficher les suggestions
  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };
  
  // Récupérer l'URL actuelle pour le contexte de navigation
  const location = useLocation();
  
  // Récupérer les informations du panier
  const { items: cartItems } = useCart();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fonction pour démarrer une nouvelle conversation
  const startNewConversation = () => {
    // Générer un nouvel ID de session
    const newSessionId = `session_${Date.now()}`;
    localStorage.setItem('chatbot_session_id', newSessionId);
    setSessionId(newSessionId);
    
    // Message de bienvenue pour la nouvelle session
    const welcomeMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: 'Bonjour ! Je suis l\'assistant virtuel d\'ESIL Events. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: Date.now()
    };
    
    // Réinitialiser les messages et sauvegarder la nouvelle session
    setMessages([welcomeMessage]);
    saveChatSession(newSessionId, { messages: [welcomeMessage] });
    setShowSuggestions(true); // Afficher les suggestions pour la nouvelle conversation
  };

  // Initialiser la session de chat
  useEffect(() => {
    // Générer un ID de session unique s'il n'existe pas déjà
    const existingSessionId = localStorage.getItem('chatbot_session_id');
    const newSessionId = existingSessionId || `session_${Date.now()}`;
    
    if (!existingSessionId) {
      localStorage.setItem('chatbot_session_id', newSessionId);
    }
    
    setSessionId(newSessionId);
    
    // Charger les messages existants
    const savedSession = loadChatSession(newSessionId);
    if (savedSession.messages.length > 0) {
      setMessages(savedSession.messages);
    } else {
      // Message de bienvenue si c'est une nouvelle session
      const welcomeMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'Bonjour ! Je suis l\'assistant virtuel d\'ESIL Events. Comment puis-je vous aider aujourd\'hui ?',
        timestamp: Date.now()
      };
      setMessages([welcomeMessage]);
      saveChatSession(newSessionId, { messages: [welcomeMessage] });
    }
  }, []);

  // Faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    // Focus sur l'input lorsque le chatbot est ouvert
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);
    
    // Détection du caractère @ suivi de texte
    const mentionMatch = value.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setProductQuery(query);
      setShowProductSuggestions(true);
      
      // Calculer la position du @ pour positionner la liste déroulante
      const startPos = value.lastIndexOf('@');
      setMentionPosition({
        start: startPos,
        end: value.length
      });
    } else {
      setShowProductSuggestions(false);
      setProductQuery('');
      setMentionPosition(null);
    }
  };
  
  // Fonction pour utiliser une suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };
  
  // Fonction pour sélectionner une suggestion de produit
  const handleProductSuggestionClick = (product: ProductSuggestion) => {
    if (mentionPosition) {
      // Remplacer le texte après @ par le nom du produit
      const beforeMention = inputMessage.substring(0, mentionPosition.start);
      const afterMention = inputMessage.substring(mentionPosition.end);
      const newInputMessage = `${beforeMention}@${product.name}${afterMention}`;
      
      setInputMessage(newInputMessage);
      setShowProductSuggestions(false);
      setMentionPosition(null);
      inputRef.current?.focus();
    }
  };
  
  // Effet pour charger les suggestions de produits lorsque la requête change
  useEffect(() => {
    const fetchProductSuggestions = async () => {
      if (debouncedProductQuery.length >= 2) {
        setProductSuggestionsLoading(true);
        try {
          const suggestions = await getProductSuggestions(debouncedProductQuery);
          setProductSuggestions(suggestions);
        } catch (error) {
          console.error('Erreur lors de la récupération des suggestions de produits:', error);
        } finally {
          setProductSuggestionsLoading(false);
        }
      } else {
        setProductSuggestions([]);
      }
    };
    
    fetchProductSuggestions();
  }, [debouncedProductQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: Date.now()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);
    setShowSuggestions(false); // Masquer les suggestions après l'envoi d'un message
    
    // Sauvegarder la session mise à jour
    saveChatSession(sessionId, { messages: updatedMessages });
    
    try {
      // Vérifier si le message concerne une demande de devis
      const isQuoteRequest = userMessage.content.toLowerCase().includes('devis') && 
        (userMessage.content.toLowerCase().includes('envoyer') || 
         userMessage.content.toLowerCase().includes('générer') || 
         userMessage.content.toLowerCase().includes('créer'));
      
      if (isQuoteRequest) {
        // Traiter la demande de devis via la fonction spécifique
        console.log('Détection d\'une demande de devis dans le message:', userMessage.content);
        const quoteResult = await handleQuoteRequestViaChatbot(userMessage.content);
        
        // Ajouter la réponse du chatbot concernant le devis
        const botMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: quoteResult.response,
          timestamp: Date.now()
        };
        
        const finalMessages = [...updatedMessages, botMessage];
        setMessages(finalMessages);
        
        // Sauvegarder la session avec la réponse
        saveChatSession(sessionId, { messages: finalMessages });
      } else {
        // Générer une réponse standard avec le contexte de navigation et du panier
        const result = await generateChatbotResponse(
          userMessage.content,
          updatedMessages,
          { 
            includeProductInfo: true, 
            maxProductsToInclude: 3,
            currentUrl: `${window.location.origin}${location.pathname}`,
            cartItems: cartItems
          }
        );
        
        // Ajouter la réponse du chatbot
        const botMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: result.response || "Désolé, je n'ai pas pu générer une réponse. Veuillez réessayer.",
          timestamp: Date.now()
        };
        
        const finalMessages = [...updatedMessages, botMessage];
        setMessages(finalMessages);
        
        // Sauvegarder la session avec la réponse
        saveChatSession(sessionId, { messages: finalMessages });
      }
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse:', error);
      
      // Message d'erreur
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: "Désolé, une erreur s'est produite. Veuillez réessayer plus tard.",
        timestamp: Date.now()
      };
      
      setMessages([...updatedMessages, errorMessage]);
      saveChatSession(sessionId, { messages: [...updatedMessages, errorMessage] });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Bouton du chatbot */}
      <button
        onClick={toggleChatbot}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 animate-pulse-subtle"
        aria-label="Ouvrir le chatbot"
      >
        <MessageSquare size={24} />
      </button>

      {/* Fenêtre du chatbot */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out animate-fade-in">
          {/* En-tête du chatbot */}
          <div className="bg-indigo-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center">
              <MessageSquare size={20} className="mr-2" />
              <h3 className="font-medium">Assistant ESIL Events</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={startNewConversation} 
                className="text-white hover:text-gray-200 focus:outline-none" 
                aria-label="Nouvelle conversation"
                title="Démarrer une nouvelle conversation"
              >
                <RefreshCw size={18} />
              </button>
              <button 
                onClick={toggleMinimize} 
                className="text-white hover:text-gray-200 focus:outline-none"
                aria-label={isMinimized ? "Agrandir" : "Réduire"}
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button 
                onClick={toggleChatbot} 
                className="text-white hover:text-gray-200 focus:outline-none"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Corps du chatbot */}
          {!isMinimized && (
            <>
              {/* Zone des messages */}
              <div className="h-80 overflow-y-auto p-4 bg-gray-50">
                <div className="flex justify-end mb-2">
                  <button 
                    onClick={toggleSuggestions}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors"
                  >
                    <HelpCircle size={14} className="mr-1" />
                    {showSuggestions ? 'Masquer suggestions' : 'Afficher suggestions'}
                  </button>
                </div>
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white border border-gray-200 text-gray-800'}`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="text-sm markdown-content">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({node, ...props}) => <a {...props} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer" />,
                              ul: ({node, ...props}) => <ul {...props} className="list-disc pl-4 my-2" />,
                              ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-4 my-2" />,
                              h1: ({node, ...props}) => <h1 {...props} className="text-lg font-bold my-2" />,
                              h2: ({node, ...props}) => <h2 {...props} className="text-base font-bold my-2" />,
                              h3: ({node, ...props}) => <h3 {...props} className="text-sm font-bold my-2" />,
                              p: ({node, ...props}) => <p {...props} className="my-1" />,
                              code: ({node, ...props}) => <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-xs" />,
                              pre: ({node, ...props}) => <pre {...props} className="bg-gray-100 p-2 rounded my-2 overflow-x-auto text-xs" />
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="text-sm">{msg.content}</div>
                      )}
                      <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                        {formatTimestamp(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Suggestions de questions */}
                {showSuggestions && messages.length <= 1 && (
                  <div className="mt-4 mb-2">
                    <div className="flex items-center mb-2">
                      <HelpCircle size={16} className="text-indigo-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Questions fréquentes</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {questionSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors px-3 py-1.5 rounded-full"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-white border border-gray-200 text-gray-800 rounded-lg p-3 max-w-[80%]">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 bg-white">
                <div className="flex items-center relative">
                  <input
                    type="text"
                    ref={inputRef}
                    value={inputMessage}
                    onChange={handleInputChange}
                    placeholder="Tapez votre message... (utilisez @ pour mentionner un produit)"
                    className="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white rounded-r-lg p-2 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    <Send size={20} className={isLoading ? '' : 'animate-pulse-once'} />
                  </button>
                  
                  {/* Liste déroulante des suggestions de produits */}
                  {showProductSuggestions && (
                    <div className="absolute left-0 right-0 bottom-full mb-1 bg-white rounded-lg shadow-lg border border-gray-200 product-suggestion-dropdown z-50">
                      <div className="p-2 border-b border-gray-200 bg-indigo-50">
                        <div className="flex items-center">
                          <Tag size={14} className="text-indigo-500 mr-2" />
                          <span className="text-xs font-medium text-gray-700">Suggestions de produits</span>
                        </div>
                      </div>
                      
                      {productSuggestionsLoading ? (
                        <div className="p-4 text-center text-gray-500">
                          <div className="flex justify-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      ) : productSuggestions.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {productSuggestions.map((product) => (
                            <div 
                              key={product.id}
                              className="p-2 product-suggestion-item cursor-pointer flex items-center"
                              onClick={() => handleProductSuggestionClick(product)}
                            >
                              <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 mr-3 flex-shrink-0">
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  className="product-suggestion-image"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/images/default-product.svg';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                                <p className="text-xs text-gray-500 truncate">{product.reference}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : debouncedProductQuery.length >= 2 ? (
                        <div className="p-4 text-center text-gray-500">
                          <p className="text-sm">Aucun produit trouvé</p>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <p className="text-sm">Tapez au moins 2 caractères après @ pour rechercher</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;