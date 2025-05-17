import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatbotInput from './ChatbotInput';
import { ChatMessage as ChatMessageType, ChatAction, ChatFilter } from '../../../types/chatbot';
import { X, Bot, Trash2 } from 'lucide-react';

interface ChatbotWindowProps {
  messages: ChatMessageType[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
  isLoading: boolean;
  onActionClick?: (action: ChatAction) => void;
  onClearHistory?: () => void;
}

const ChatbotWindow: React.FC<ChatbotWindowProps> = ({ 
  messages, 
  onSendMessage, 
  onClose, 
  isLoading, 
  onActionClick,
  onClearHistory 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleClearHistory = () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer l\'historique des conversations ?')) {
      onClearHistory?.();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  const handleFilterClick = (filter: ChatFilter) => {
    let filterCommand = '';
    switch (filter.type) {
      case 'amount':
        filterCommand = `filtrer devis montant 1000`;
        break;
      case 'client':
        filterCommand = `filtrer devis client`;
        break;
      case 'date':
        filterCommand = `filtrer devis date ${new Date().toLocaleDateString('fr-FR')}`;
        break;
      case 'status':
        filterCommand = `filtrer devis status ${filter.value}`;
        break;
    }
    onSendMessage(filterCommand);
  };

  return (
    <div className="fixed bottom-20 right-6 w-full max-w-md h-[70vh] max-h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 z-[999] transform transition-all duration-300 ease-out animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-t-xl">
        <div className="flex items-center space-x-2">
          <Bot size={22} />
          <h3 className="text-lg font-semibold">Assistant Devis</h3>
        </div>
        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors duration-200"
              aria-label="Effacer l'historique"
              title="Effacer l'historique"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors duration-200"
            aria-label="Fermer le chatbot"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow p-4 overflow-y-auto space-y-3 custom-scrollbar">
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id} 
            message={msg} 
            onActionClick={onActionClick}
            onSuggestionClick={handleSuggestionClick}
            onFilterClick={handleFilterClick}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatbotInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatbotWindow; 