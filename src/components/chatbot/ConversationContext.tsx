import React from 'react';
import { ChatMessage } from '../../services/chatbotService';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ConversationContextProps {
  messages: ChatMessage[];
  isExpanded: boolean;
  toggleExpanded: () => void;
}

const ConversationContext: React.FC<ConversationContextProps> = ({
  messages,
  isExpanded,
  toggleExpanded
}) => {
  // Filtrer les messages pour n'afficher que l'historique (pas le message actuel)
  const historyMessages = messages.slice(0, -1);

  if (historyMessages.length === 0) {
    return null; // Ne rien afficher s'il n'y a pas d'historique
  }

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium flex items-center">
          {isExpanded ? "Masquer le contexte" : "Afficher le contexte"} 
          <span className="text-xs ml-2 text-gray-500">({historyMessages.length} message{historyMessages.length > 1 ? 's' : ''})</span>
        </span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="p-3 max-h-40 overflow-y-auto">
          {historyMessages.map((message) => (
            <div key={message.id} className="mb-2 last:mb-0">
              <div className="flex items-start">
                <div 
                  className={`w-2 h-2 mt-1.5 mr-2 rounded-full ${message.role === 'user' ? 'bg-violet-400' : 'bg-gray-400'}`}
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-gray-700">
                      {message.role === 'user' ? 'Vous' : 'Assistant'}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {message.timestamp instanceof Date 
                        ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationContext;