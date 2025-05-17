import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatbotInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatbotInput: React.FC<ChatbotInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Posez votre question..."
        className="flex-grow px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent text-sm dark:bg-gray-700 dark:text-white transition-all duration-200"
        disabled={isLoading}
        aria-label="Votre message au chatbot"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="ml-3 p-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
        aria-label="Envoyer le message"
      >
        <Send size={20} />
      </button>
    </form>
  );
};

export default ChatbotInput; 