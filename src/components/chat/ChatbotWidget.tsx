import React from 'react';
import { FaComments } from 'react-icons/fa';
import styled from 'styled-components';

const WidgetButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1000;

  &:hover {
    transform: scale(1.1);
    background-color: #0056b3;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

interface ChatbotWidgetProps {
  onClick: () => void;
  isOpen: boolean;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ onClick, isOpen }) => {
  if (isOpen) return null;

  return (
    <WidgetButton onClick={onClick} aria-label="Ouvrir le chat">
      <FaComments />
    </WidgetButton>
  );
}; 