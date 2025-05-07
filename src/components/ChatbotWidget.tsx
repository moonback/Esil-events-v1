import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { generateChatbotResponse, ChatMessage, saveChatSession, loadChatSession } from '../services/chatbotService';

const ChatbotWidget: React.FC = () => {
  // État pour gérer l'ouverture/fermeture du chatbot
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setInputMessage(e.target.value);
  };

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
    
    // Sauvegarder la session mise à jour
    saveChatSession(sessionId, { messages: updatedMessages });
    
    try {
      // Générer une réponse
      const result = await generateChatbotResponse(
        userMessage.content,
        updatedMessages,
        { includeProductInfo: true, maxProductsToInclude: 3 }
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
        className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label="Ouvrir le chatbot"
      >
        <MessageSquare size={24} />
      </button>

      {/* Fenêtre du chatbot */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out">
          {/* En-tête du chatbot */}
          <div className="bg-indigo-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center">
              <MessageSquare size={20} className="mr-2" />
              <h3 className="font-medium">Assistant ESIL Events</h3>
            </div>
            <div className="flex items-center space-x-2">
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
                      <div className="text-sm">{msg.content}</div>
                      <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                        {formatTimestamp(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
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
                <div className="flex items-center">
                  <input
                    type="text"
                    ref={inputRef}
                    value={inputMessage}
                    onChange={handleInputChange}
                    placeholder="Tapez votre message..."
                    className="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white rounded-r-lg p-2 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    <Send size={20} />
                  </button>
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