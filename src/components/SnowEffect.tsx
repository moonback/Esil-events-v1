import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';

const snowFall = keyframes`
  0% {
    transform: translateY(-10vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(110vh) rotate(360deg);
    opacity: 0.8;
  }
`;

const SnowContainer = styled.div`
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

const Snowflake = styled.div<{
  $size: number;
  $left: number;
  $duration: number;
  $delay: number;
}>`
  position: fixed;
  top: 0;
  left: ${props => props.$left}vw;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  background: white;
  border-radius: 50%;
  opacity: 0.8;
  animation: ${snowFall} ${props => props.$duration}s linear infinite;
  animation-delay: ${props => props.$delay}s;
`;

const FLAKE_COUNT = 50;

const SnowEffect: React.FC = () => {
  // Génère les propriétés des flocons une seule fois
  const flakes = useMemo(() => {
    return Array.from({ length: FLAKE_COUNT }).map((_, i) => ({
      key: i,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100, // en vw
      duration: Math.random() * 5 + 5, // 5 à 10 secondes
      delay: Math.random() * 10, // jusqu'à 10s de délai
    }));
  }, []);

  const content = (
    <SnowContainer>
      {flakes.map(flake => (
        <Snowflake
          key={flake.key}
          $size={flake.size}
          $left={flake.left}
          $duration={flake.duration}
          $delay={flake.delay}
        />
      ))}
    </SnowContainer>
  );

  return createPortal(content, document.body);
};

export default SnowEffect; 