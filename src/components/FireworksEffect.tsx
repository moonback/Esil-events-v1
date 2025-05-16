import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

const burst = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  10% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
`;

const FireworksContainer = styled.div`
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

const Firework = styled.div<{
  $x: number;
  $y: number;
  $color: string;
  $delay: number;
}>`
  position: absolute;
  left: ${props => props.$x}vw;
  top: ${props => props.$y}vh;
  width: 80px;
  height: 80px;
  pointer-events: none;
  border-radius: 50%;
  opacity: 0;
  animation: ${burst} 1.2s ease-out infinite;
  animation-delay: ${props => props.$delay}s;
  box-shadow:
    0 0 0 2px ${props => props.$color},
    0 0 10px 4px ${props => props.$color}44,
    0 0 40px 8px ${props => props.$color}22;

  &::before, &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 60px;
    height: 2px;
    background: ${props => props.$color};
    border-radius: 2px;
    transform-origin: left center;
  }
  &::before {
    transform: rotate(45deg);
  }
  &::after {
    transform: rotate(-45deg);
  }
`;

const COLORS = [
  '#ff3b3b', '#ffd93b', '#3bffb8', '#3b6cff', '#ff3be6', '#fff', '#ff8c3b', '#3bff57'
];

const FireworksEffect: React.FC = () => {
  const fireworks = useRef<any[]>([]);

  // Génère des feux d'artifice aléatoires
  useEffect(() => {
    const interval = setInterval(() => {
      // Force un rerender en changeant la clé
      fireworks.current = Array.from({ length: 8 }).map((_, i) => ({
        key: Math.random() + '-' + i + '-' + Date.now(),
        x: Math.random() * 80 + 10, // 10vw à 90vw
        y: Math.random() * 60 + 10, // 10vh à 70vh
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 1.2,
      }));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // On utilise un state local pour forcer le rerender
  const [tick, setTick] = React.useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(tick => tick + 1), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <FireworksContainer>
      {fireworks.current.map(fw => (
        <Firework
          key={fw.key}
          $x={fw.x}
          $y={fw.y}
          $color={fw.color}
          $delay={fw.delay}
        />
      ))}
    </FireworksContainer>
  );
};

export default FireworksEffect; 