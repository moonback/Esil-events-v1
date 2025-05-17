import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { Message } from './types';
import { ProductSuggestionCard } from './ProductSuggestionCard';
import { MoodboardCard } from './MoodboardCard';
import { ChecklistDisplay } from './ChecklistDisplay';
import { useInteractionService } from '../../services/interactionService';

const ChatContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 350px;
  height: 500px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 1000;
`;

const ChatHeader = styled.div`
  padding: 1rem;
  background-color: #007bff;
  color: white;
  border-radius: 10px 10px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

interface MessageBubbleProps {
  $isUser: boolean;
}

const MessageBubble = styled.div<MessageBubbleProps>`
  max-width: 80%;
  padding: 0.8rem;
  border-radius: 15px;
  background-color: ${props => props.$isUser ? '#007bff' : '#f0f0f0'};
  color: ${props => props.$isUser ? 'white' : 'black'};
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
`;

const InputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;

  &:focus {
    border-color: #007bff;
  }
`;

const SendButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const QuickRepliesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const QuickReplyButton = styled.button`
  background: #f0f0f0;
  border: none;
  border-radius: 15px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e0e0e0;
  }
`;

interface ChatWindowProps {
  messages: Message[];
  onClose: () => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onClose,
  onSendMessage,
  isLoading
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    handleProductClick,
    handleMoodboardClick,
    getProductDetails,
    getMoodboardDetails,
    getChecklistForEventType
  } = useInteractionService();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChecklistItemToggle = (itemId: string) => {
    // TODO: Implémenter la sauvegarde de l'état de la checklist
    console.log('Checklist item toggled:', itemId);
  };

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'product':
        const product = getProductDetails(message.metadata?.productId || '');
        if (!product) return null;
        return (
          <ProductSuggestionCard
            productId={product.id}
            title={product.title}
            description={product.description}
            price={product.price}
            onClick={() => handleProductClick(product.id)}
          />
        );
      case 'moodboard':
        const moodboard = getMoodboardDetails(message.metadata?.moodboardId || '');
        if (!moodboard) return null;
        return (
          <MoodboardCard
            moodboardId={moodboard.id}
            title={moodboard.title}
            description={moodboard.description}
            tags={moodboard.tags}
            onClick={() => handleMoodboardClick(moodboard.id)}
          />
        );
      case 'checklist':
        const eventType = message.metadata?.eventType || 'mariage';
        const checklistItems = getChecklistForEventType(eventType);
        return (
          <ChecklistDisplay
            checklistId={message.metadata?.checklistId || ''}
            title={`Checklist pour ${eventType}`}
            items={checklistItems}
            onItemToggle={handleChecklistItemToggle}
          />
        );
      default:
        return message.content;
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <h3>Assistant Événementiel</h3>
        <CloseButton onClick={onClose} aria-label="Fermer le chat">
          <FaTimes />
        </CloseButton>
      </ChatHeader>
      
      <MessagesContainer>
        {messages.map((message) => (
          <MessageBubble key={message.id} $isUser={message.sender === 'user'}>
            {renderMessageContent(message)}
            {message.type === 'text' && message.metadata?.quickReplies && (
              <QuickRepliesContainer>
                {message.metadata.quickReplies.map((reply: string, index: number) => (
                  <QuickReplyButton
                    key={index}
                    onClick={() => onSendMessage(reply)}
                  >
                    {reply}
                  </QuickReplyButton>
                ))}
              </QuickRepliesContainer>
            )}
          </MessageBubble>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Écrivez votre message..."
          disabled={isLoading}
        />
        <SendButton onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
          Envoyer
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
}; 