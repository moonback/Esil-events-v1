import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

const petalFall = keyframes`
  0% { top: -10vh; opacity: 0; transform: rotate(0deg) scale(1); }
  10% { opacity: 1; }
  100% { top: 110vh; opacity: 0.8; transform: rotate(360deg) scale(1.2); }
`;

const SpringContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 99999;
  overflow: hidden;
`;

const Petal = styled.div<{ $left: number; $delay: number; $duration: number; $size: number }>`
  position: absolute;
  left: ${props => props.$left}vw;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  top: -10vh;
  animation: ${petalFall} ${props => props.$duration}s linear infinite;
  animation-delay: ${props => props.$delay}s;
  pointer-events: none;
`;

const PetalSVG = ({ color = '#ffb6c1' }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="24" rx="8" ry="12" fill={color} />
    <ellipse cx="16" cy="8" rx="4" ry="8" fill={color} />
    <ellipse cx="8" cy="16" rx="4" ry="8" fill={color} />
    <ellipse cx="24" cy="16" rx="4" ry="8" fill={color} />
  </svg>
);

const PETAL_COLORS = ['#ffb6c1', '#ffd1dc', '#ffe4e1', '#f8b195', '#f67280'];
const SPRING_PETALS = 18;

const SpringEffect: React.FC = () => {
  const petals = useMemo(() => Array.from({ length: SPRING_PETALS }).map((_, i) => ({
    key: 'petal-' + i,
    left: Math.random() * 98,
    delay: Math.random() * 6,
    duration: Math.random() * 4 + 6,
    size: Math.random() * 16 + 24,
    color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
  })), []);

  return (
    <SpringContainer>
      {petals.map(petal => (
        <Petal
          key={petal.key}
          $left={petal.left}
          $delay={petal.delay}
          $duration={petal.duration}
          $size={petal.size}
        >
          <PetalSVG color={petal.color} />
        </Petal>
      ))}
    </SpringContainer>
  );
};

export default SpringEffect; 