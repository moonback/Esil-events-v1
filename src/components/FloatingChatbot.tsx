import React, { useState } from 'react';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import ProductChatbot from './ProductChatbot';

const FloatingChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg focus:outline-none"
        onClick={() => setOpen(!open)}
        aria-label="Ouvrir le chatbot"
      >
        <IoChatbubbleEllipsesOutline size={28} />
      </button>

      {/* Chatbot Modal/Panel */}
      {open && (
        <div className="fixed bottom-20 right-0 z-50 w-full md:w-[600px] lg:w-[800px] h-[80vh] md:h-[600px] mx-1 md:mx-0 bg-white dark:bg-gray-900 border border-gray-300 rounded-xl shadow-2xl flex flex-col">
          <div className="flex justify-between items-center p-2 border-b border-gray-200">
            <span className="font-semibold text-blue-700">Assistant Virtuel</span>
            <button
              className="text-gray-500 hover:text-red-500"
              onClick={() => setOpen(false)}
              aria-label="Fermer le chatbot"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ProductChatbot />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;