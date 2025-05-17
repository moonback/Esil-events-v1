import React from 'react';
import { MessageSquare, X } from 'lucide-react';

interface ChatbotIconProps {
  isOpen: boolean;
  toggleChatbot: () => void;
  unreadMessages?: number;
}

const ChatbotIcon: React.FC<ChatbotIconProps> = ({ isOpen, toggleChatbot, unreadMessages }) => {
  return (
    <button
      onClick={toggleChatbot}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 rounded-full shadow-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 z-[1000]"
      aria-label={isOpen ? "Fermer le chatbot" : "Ouvrir le chatbot"}
    >
      {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      {unreadMessages && unreadMessages > 0 && !isOpen && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">
            {unreadMessages}
          </span>
        </span>
      )}
    </button>
  );
};

export default ChatbotIcon; 