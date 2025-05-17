import React from 'react';
import { ChatMessage as ChatMessageType, ChatAction, ChatFilter } from '../../../types/chatbot';
import { Bot, User, CornerDownRight, MessageSquare, Filter } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  onActionClick?: (action: ChatAction) => void;
  onSuggestionClick?: (suggestion: string) => void;
  onFilterClick?: (filter: ChatFilter) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onActionClick, onSuggestionClick, onFilterClick }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 last:mb-0`}>
      <div
        className={`max-w-[80%] p-3 rounded-xl shadow ${
          isUser
            ? 'bg-violet-500 text-white rounded-br-none'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
        }`}
      >
        <div className="flex items-start space-x-2">
          {!isUser && <Bot size={18} className="text-violet-500 dark:text-violet-400 flex-shrink-0 mt-0.5" />}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          {isUser && <User size={18} className="text-violet-200 flex-shrink-0 mt-0.5" />}
        </div>

        {/* Actions */}
        {message.actions && message.actions.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 space-y-1.5">
            {message.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => onActionClick && onActionClick(action)}
                className="flex items-center w-full text-left px-3 py-1.5 text-xs font-medium bg-violet-100 dark:bg-violet-800 text-violet-700 dark:text-violet-300 rounded-md hover:bg-violet-200 dark:hover:bg-violet-700 transition-colors"
              >
                <CornerDownRight size={12} className="mr-1.5" />
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Filters */}
        {message.filters && message.filters.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Filtres disponibles :</p>
            <div className="flex flex-wrap gap-1.5">
              {message.filters.map((filter, index) => (
                <button
                  key={index}
                  onClick={() => onFilterClick && onFilterClick(filter)}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  <Filter size={10} className="mr-1" />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Suggestions :</p>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  <MessageSquare size={10} className="mr-1" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {message.isTyping && (
          <div className="flex items-center space-x-1 mt-1">
            <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse delay-0"></div>
            <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse delay-150"></div>
            <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse delay-300"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 