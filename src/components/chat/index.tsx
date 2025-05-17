import React from 'react';
import { ChatbotWidget } from './ChatbotWidget';
import { ChatWindow } from './ChatWindow';
import { useChatbot } from '../../hooks/useChatbot';

export const Chatbot: React.FC = () => {
  const {
    messages,
    isLoading,
    isOpen,
    sendMessage,
    toggleChat
  } = useChatbot();

  return (
    <>
      <ChatbotWidget onClick={toggleChat} isOpen={isOpen} />
      {isOpen && (
        <ChatWindow
          messages={messages}
          onClose={toggleChat}
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      )}
    </>
  );
}; 