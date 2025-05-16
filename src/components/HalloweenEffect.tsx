import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

const batFly = keyframes`
  0% { transform: translateY(0) translateX(0) scaleX(1); }
  20% { transform: translateY(-20px) translateX(20vw) scaleX(-1); }
  40% { transform: translateY(10px) translateX(40vw) scaleX(1); }
  60% { transform: translateY(-10px) translateX(60vw) scaleX(-1); }
  80% { transform: translateY(20px) translateX(80vw) scaleX(1); }
  100% { transform: translateY(0) translateX(100vw) scaleX(-1); }
`;

const pumpkinFall = keyframes`
  0% { top: -10vh; opacity: 0; }
  10% { opacity: 1; }
  100% { top: 110vh; opacity: 0.8; }
`;

const HalloweenContainer = styled.div`
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

const Bat = styled.div<{ $top: number; $delay: number; $duration: number }>`
  position: absolute;
  top: ${props => props.$top}vh;
  left: 0;
  width: 40px;
  height: 20px;
  animation: ${batFly} ${props => props.$duration}s linear infinite;
  animation-delay: ${props => props.$delay}s;
  pointer-events: none;
  z-index: 1;
`;

const Pumpkin = styled.div<{ $left: number; $delay: number; $duration: number }>`
  position: absolute;
  left: ${props => props.$left}vw;
  width: 32px;
  height: 32px;
  top: -10vh;
  animation: ${pumpkinFall} ${props => props.$duration}s linear infinite;
  animation-delay: ${props => props.$delay}s;
  pointer-events: none;
  z-index: 2;
`;

const BatSVG = () => (
  <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 10 Q10 2 20 10 Q30 2 38 10 Q30 18 20 10 Q10 18 2 10" fill="#222" />
    <ellipse cx="10" cy="10" rx="2" ry="3" fill="#222" />
    <ellipse cx="30" cy="10" rx="2" ry="3" fill="#222" />
  </svg>
);

const PumpkinSVG = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="20" rx="12" ry="10" fill="#ff9900" stroke="#b35c00" strokeWidth="2" />
    <rect x="14" y="7" width="4" height="8" rx="2" fill="#b35c00" />
    <ellipse cx="16" cy="20" rx="6" ry="5" fill="#ffb84d" />
  </svg>
);

const HALLOWEEN_BATS = 7;
const HALLOWEEN_PUMPKINS = 10;

const HalloweenEffect: React.FC = () => {
  const bats = useMemo(() => Array.from({ length: HALLOWEEN_BATS }).map((_, i) => ({
    key: 'bat-' + i,
    top: Math.random() * 80,
    delay: Math.random() * 5,
    duration: Math.random() * 6 + 8,
  })), []);

  const pumpkins = useMemo(() => Array.from({ length: HALLOWEEN_PUMPKINS }).map((_, i) => ({
    key: 'pumpkin-' + i,
    left: Math.random() * 95,
    delay: Math.random() * 6,
    duration: Math.random() * 4 + 6,
  })), []);

  return (
    <HalloweenContainer>
      {bats.map(bat => (
        <Bat key={bat.key} $top={bat.top} $delay={bat.delay} $duration={bat.duration}>
          <BatSVG />
        </Bat>
      ))}
      {pumpkins.map(pumpkin => (
        <Pumpkin key={pumpkin.key} $left={pumpkin.left} $delay={pumpkin.delay} $duration={pumpkin.duration}>
          <PumpkinSVG />
        </Pumpkin>
      ))}
    </HalloweenContainer>
  );
};

export default HalloweenEffect; 