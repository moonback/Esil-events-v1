import React from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';
import SnowEffect from './SnowEffect';

const FestiveContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99999;
  overflow: hidden;
`;

const ValentineHearts = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  pointer-events: none;
`;

const Heart = styled.div<{ $left: number; $top: number; $delay: number }>`
  position: fixed;
  width: 20px;
  height: 20px;
  background: #ff69b4;
  transform: rotate(45deg);
  left: ${props => props.$left}%;
  top: ${props => props.$top}%;
  animation: float 4s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  opacity: 0.6;

  &:before,
  &:after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: #ff69b4;
    border-radius: 50%;
  }

  &:before {
    left: -10px;
  }

  &:after {
    top: -10px;
  }

  @keyframes float {
    0% {
      transform: translateY(0) rotate(45deg);
    }
    50% {
      transform: translateY(-20px) rotate(45deg);
    }
    100% {
      transform: translateY(0) rotate(45deg);
    }
  }
`;

const FestiveEffects: React.FC = () => {
  const { currentTheme } = useTheme();

  const renderValentineHearts = () => {
    const hearts = [];
    for (let i = 0; i < 20; i++) {
      hearts.push(
        <Heart
          key={i}
          $left={Math.random() * 100}
          $top={Math.random() * 80}
          $delay={Math.random() * 4}
        />
      );
    }
    return hearts;
  };

  const content = (
    <FestiveContainer>
      {currentTheme === 'christmas' && <SnowEffect />}
      {currentTheme === 'valentine' && (
        <ValentineHearts>
          {renderValentineHearts()}
        </ValentineHearts>
      )}
    </FestiveContainer>
  );

  return createPortal(content, document.body);
};

export default FestiveEffects; 