import React, { useState, useEffect } from 'react';

const BatSVG = ({ color = "#222" }) => (
  <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 13C20 13 10 5 2 12C2 12 6 4 15 8C15 8 17 2 20 2C23 2 25 8 25 8C34 4 38 12 38 12C30 5 20 13 20 13Z" fill={color} />
    <path d="M20 13C20 13 10 21 2 14C2 14 6 22 15 18C15 18 17 24 20 24C23 24 25 18 25 18C34 22 38 14 38 14C30 21 20 13 20 13Z" fill={color} />
    <ellipse cx="15" cy="13" rx="2" ry="3" fill={color} />
    <ellipse cx="25" cy="13" rx="2" ry="3" fill={color} />
    <path d="M15 13C15 13 15.5 12 16 12" stroke="#444" strokeWidth="0.5" />
    <path d="M25 13C25 13 24.5 12 24 12" stroke="#444" strokeWidth="0.5" />
    <path d="M20 2C20 2 19 3 19 4" stroke="#444" strokeWidth="0.5" />
    <path d="M20 2C20 2 21 3 21 4" stroke="#444" strokeWidth="0.5" />
  </svg>
);

const PumpkinSVG = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 8C19 8 18 7 18 5C18 3 19 2 20 2C21 2 22 3 22 5C22 7 21 8 20 8Z" fill="#2F4F1A" />
    <path d="M16 10C11 12 8 18 8 25C8 32 12 37 20 37C28 37 32 32 32 25C32 18 29 12 24 10" fill="#FF7518" />
    <path d="M18 10C13 12 10 17 10 22C10 27 12 32 20 32C28 32 30 27 30 22C30 17 27 12 22 10" fill="#FFA04D" />
    <path d="M16 17C16 17 20 15 24 17C24 17 24 21 20 21C16 21 16 17 16 17Z" fill="#4D1F00" />
    <path d="M16 24C18 26 22 26 24 24" stroke="#4D1F00" strokeWidth="2" strokeLinecap="round" />
    <path d="M14 28C14 28 16 30 20 30C24 30 26 28 26 28" stroke="#4D1F00" strokeWidth="1" strokeLinecap="round" />
    <path d="M12 25C12 25 14 27 20 27C26 27 28 25 28 25" stroke="#4D1F00" strokeWidth="1" strokeLinecap="round" />
    <path d="M15 20C15 20 16 19 20 19C24 19 25 20 25 20" stroke="#4D1F00" strokeWidth="1" strokeLinecap="round" />
    <path d="M16 15C16 15 18 14 20 14C22 14 24 15 24 15" stroke="#4D1F00" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const GhostSVG = () => (
  <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2C10 2 4 8 4 16V36C4 36 4 38 2 38C0 38 0 40 2 42C4 44 6 42 6 42C6 42 10 48 14 46C18 44 18 42 18 42C18 42 18 44 22 46C26 48 30 42 30 42C30 42 32 44 34 42C36 40 36 38 34 38C32 38 32 36 32 36V16C32 8 26 2 18 2Z" fill="white" />
    <path d="M18 2C10 2 4 8 4 16V36C4 36 4 38 2 38C0 38 0 40 2 42C4 44 6 42 6 42C6 42 10 48 14 46C18 44 18 42 18 42C18 42 18 44 22 46C26 48 30 42 30 42C30 42 32 44 34 42C36 40 36 38 34 38C32 38 32 36 32 36V16C32 8 26 2 18 2Z" fill="url(#ghostGradient)" />
    <ellipse cx="12" cy="20" rx="3" ry="4" fill="#333" />
    <ellipse cx="24" cy="20" rx="3" ry="4" fill="#333" />
    <path d="M12 20C12 20 12.5 19 13 19" stroke="#666" strokeWidth="0.5" />
    <path d="M24 20C24 20 23.5 19 23 19" stroke="#666" strokeWidth="0.5" />
    <path d="M18 28C18 28 16 30 14 30" stroke="#333" strokeWidth="1" strokeLinecap="round" />
    <path d="M18 28C18 28 20 30 22 30" stroke="#333" strokeWidth="1" strokeLinecap="round" />
    <defs>
      <linearGradient id="ghostGradient" x1="18" y1="2" x2="18" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="white" stopOpacity="1" />
        <stop offset="100%" stopColor="white" stopOpacity="0.8" />
      </linearGradient>
    </defs>
  </svg>
);

const SpiderSVG = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="10" fill="#333" />
    <circle cx="24" cy="24" r="6" fill="#555" />
    <circle cx="21" cy="21" rx="2" ry="2" fill="white" />
    <circle cx="27" cy="21" rx="2" ry="2" fill="white" />
    <path d="M12 12L6 6" stroke="#333" strokeWidth="2" />
    <path d="M36 12L42 6" stroke="#333" strokeWidth="2" />
    <path d="M12 36L6 42" stroke="#333" strokeWidth="2" />
    <path d="M36 36L42 42" stroke="#333" strokeWidth="2" />
    <path d="M8 20L2 20" stroke="#333" strokeWidth="2" />
    <path d="M46 20L40 20" stroke="#333" strokeWidth="2" />
    <path d="M8 28L2 28" stroke="#333" strokeWidth="2" />
    <path d="M46 28L40 28" stroke="#333" strokeWidth="2" />
    <path d="M21 21C21 21 21.5 20 22 20" stroke="#666" strokeWidth="0.5" />
    <path d="M27 21C27 21 26.5 20 26 20" stroke="#666" strokeWidth="0.5" />
    <path d="M24 24C24 24 23 25 22 25" stroke="#666" strokeWidth="0.5" />
    <path d="M24 24C24 24 25 25 26 25" stroke="#666" strokeWidth="0.5" />
    <path d="M12 12C12 12 11 11 10 11" stroke="#444" strokeWidth="0.5" />
    <path d="M36 12C36 12 37 11 38 11" stroke="#444" strokeWidth="0.5" />
    <path d="M12 36C12 12 11 37 10 37" stroke="#444" strokeWidth="0.5" />
    <path d="M36 36C36 36 37 37 38 37" stroke="#444" strokeWidth="0.5" />
  </svg>
);

const Moon = () => (
  <div className="absolute top-6 right-6 z-10">
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="26" fill="#FFE07D" />
      <path d="M30 4C18 4 8 12 8 30C8 48 22 56 38 50C50 46 46 36 40 34C34 32 30 36 30 40C30 44 34 46 38 44C42 42 42 38 38 36" fill="#FFEFB6" />
      <circle cx="18" cy="20" r="2" fill="#FFB833" />
      <circle cx="38" cy="16" r="3" fill="#FFB833" />
      <circle cx="32" cy="30" r="2" fill="#FFB833" />
      <circle cx="44" cy="30" r="2" fill="#FFB833" />
      <circle cx="24" cy="40" r="3" fill="#FFB833" />
      <path d="M30 4C30 4 29 5 29 6" stroke="#FFB833" strokeWidth="0.5" />
      <path d="M30 4C30 4 31 5 31 6" stroke="#FFB833" strokeWidth="0.5" />
      <path d="M38 50C38 50 37 49 36 49" stroke="#FFB833" strokeWidth="0.5" />
      <path d="M38 50C38 50 39 49 40 49" stroke="#FFB833" strokeWidth="0.5" />
    </svg>
  </div>
);

interface StarProps {
  top: number;
  left: number;
}

interface BatProps {
  index: number;
}

interface PumpkinProps {
  index: number;
}

interface GhostProps {
  index: number;
}

interface SpiderProps {
  index: number;
}

interface Settings {
  bats: number;
  pumpkins: number;
  ghosts: number;
  spiders: number;
  stars: number;
  fogLevel: number;
}

const Star: React.FC<StarProps> = ({ top, left }) => (
  <div className="absolute" style={{ top: `${top}vh`, left: `${left}vw` }}>
    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
  </div>
);

const Bat: React.FC<BatProps> = ({ index }) => {
  // Calculer des positions et délais aléatoires mais déterministes basés sur l'index
  const topBase = 5 + (index % 7) * 10;
  const top = topBase + Math.sin(index) * 10;
  const delay = index * 0.5;
  const duration = 12 + index % 5;
  const size = 0.7 + (index % 3) * 0.2;
  
  return (
    <div 
      className="absolute left-0 z-20"
      style={{ 
        top: `${top}vh`,
        animation: `batFly${index % 3} ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transform: `scale(${size})`,
      }}
    >
      <BatSVG />
      <style>{`
        @keyframes batFly0 {
          0% { transform: translate(0, 0) scale(${size}) rotate(0deg); }
          10% { transform: translate(20vw, -4vh) scale(${size}) rotate(5deg); }
          30% { transform: translate(40vw, 0vh) scale(${size}) rotate(-5deg); }
          50% { transform: translate(60vw, -6vh) scale(${size}) rotate(8deg); }
          70% { transform: translate(80vw, -2vh) scale(${size}) rotate(-8deg); }
          90% { transform: translate(90vw, -4vh) scale(${size}) rotate(5deg); }
          100% { transform: translate(100vw, 0) scale(${size}) rotate(0deg); }
        }
        @keyframes batFly1 {
          0% { transform: translate(0, 0) scale(${size}) rotate(0deg); }
          20% { transform: translate(20vw, -8vh) scale(${size}) rotate(-8deg); }
          40% { transform: translate(40vw, -4vh) scale(${size}) rotate(5deg); }
          60% { transform: translate(70vw, -10vh) scale(${size}) rotate(-5deg); }
          80% { transform: translate(85vw, -5vh) scale(${size}) rotate(8deg); }
          100% { transform: translate(100vw, 0) scale(${size}) rotate(0deg); }
        }
        @keyframes batFly2 {
          0% { transform: translate(0, 0) scale(${size}) rotate(0deg); }
          15% { transform: translate(15vw, -6vh) scale(${size}) rotate(10deg); }
          35% { transform: translate(45vw, -2vh) scale(${size}) rotate(-5deg); }
          55% { transform: translate(65vw, -8vh) scale(${size}) rotate(8deg); }
          75% { transform: translate(80vw, -4vh) scale(${size}) rotate(-10deg); }
          100% { transform: translate(100vw, 0) scale(${size}) rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

const Pumpkin: React.FC<PumpkinProps> = ({ index }) => {
  const left = 5 + (index % 9) * 10;
  const delay = index * 0.8;
  const duration = 8 + index % 4;
  const rotation = -15 + (index % 7) * 5;
  const size = 0.8 + (index % 3) * 0.3;
  
  return (
    <div 
      className="absolute"
      style={{ 
        left: `${left}vw`,
        animation: `pumpkinFall${index % 3} ${duration}s ease-in infinite`,
        animationDelay: `${delay}s`,
        transform: `rotate(${rotation}deg) scale(${size})`,
      }}
    >
      <PumpkinSVG />
      <style>{`
        @keyframes pumpkinFall0 {
          0% { transform: translate(0, -40px) rotate(${rotation}deg) scale(${size}); opacity: 0; }
          10% { transform: translate(-10px, 10vh) rotate(${rotation+5}deg) scale(${size}); opacity: 1; }
          30% { transform: translate(10px, 30vh) rotate(${rotation-5}deg) scale(${size}); }
          50% { transform: translate(-5px, 50vh) rotate(${rotation+10}deg) scale(${size}); }
          70% { transform: translate(8px, 70vh) rotate(${rotation-10}deg) scale(${size}); }
          90% { transform: translate(-5px, 90vh) rotate(${rotation+5}deg) scale(${size}); opacity: 1; }
          100% { transform: translate(0, 100vh) rotate(${rotation}deg) scale(${size}); opacity: 0; }
        }
        @keyframes pumpkinFall1 {
          0% { transform: translate(0, -40px) rotate(${rotation}deg) scale(${size}); opacity: 0; }
          10% { transform: translate(15px, 10vh) rotate(${rotation-8}deg) scale(${size}); opacity: 1; }
          30% { transform: translate(-10px, 30vh) rotate(${rotation+8}deg) scale(${size}); }
          50% { transform: translate(10px, 50vh) rotate(${rotation-15}deg) scale(${size}); }
          70% { transform: translate(-15px, 70vh) rotate(${rotation+10}deg) scale(${size}); }
          90% { transform: translate(10px, 90vh) rotate(${rotation-5}deg) scale(${size}); opacity: 1; }
          100% { transform: translate(0, 100vh) rotate(${rotation}deg) scale(${size}); opacity: 0; }
        }
        @keyframes pumpkinFall2 {
          0% { transform: translate(0, -40px) rotate(${rotation}deg) scale(${size}); opacity: 0; }
          10% { transform: translate(-20px, 10vh) rotate(${rotation+10}deg) scale(${size}); opacity: 1; }
          30% { transform: translate(15px, 30vh) rotate(${rotation-12}deg) scale(${size}); }
          50% { transform: translate(-10px, 50vh) rotate(${rotation+15}deg) scale(${size}); }
          70% { transform: translate(20px, 70vh) rotate(${rotation-12}deg) scale(${size}); }
          90% { transform: translate(-15px, 90vh) rotate(${rotation+8}deg) scale(${size}); opacity: 1; }
          100% { transform: translate(0, 100vh) rotate(${rotation}deg) scale(${size}); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const Ghost: React.FC<GhostProps> = ({ index }) => {
  const side = index % 2 === 0 ? 'left' : 'right';
  const basePos = side === 'left' ? 10 : 80;
  const pos = basePos + (index % 5) * 2;
  const delay = index * 1.2;
  const speed = 20 + index % 15;
  
  return (
    <div 
      className="absolute z-10"
      style={{ 
        [side]: `${pos}vw`,
        animation: `ghostFloat${index % 3} ${speed}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <GhostSVG />
      <style>{`
        @keyframes ghostFloat0 {
          0% { transform: translate(0, -100px) scale(0.8); opacity: 0; }
          10% { transform: translate(${side === 'left' ? '20px' : '-20px'}, 10vh) scale(0.8); opacity: 0.7; }
          25% { transform: translate(${side === 'left' ? '-15px' : '15px'}, 25vh) scale(0.9); opacity: 0.8; }
          50% { transform: translate(${side === 'left' ? '25px' : '-25px'}, 50vh) scale(1); opacity: 0.9; }
          75% { transform: translate(${side === 'left' ? '-20px' : '20px'}, 75vh) scale(0.9); opacity: 0.8; }
          90% { transform: translate(${side === 'left' ? '15px' : '-15px'}, 90vh) scale(0.8); opacity: 0.7; }
          100% { transform: translate(0, 110vh) scale(0.7); opacity: 0; }
        }
        @keyframes ghostFloat1 {
          0% { transform: translate(0, -100px) scale(0.7); opacity: 0; }
          10% { transform: translate(${side === 'left' ? '25px' : '-25px'}, 10vh) scale(0.75); opacity: 0.6; }
          25% { transform: translate(${side === 'left' ? '-20px' : '20px'}, 25vh) scale(0.8); opacity: 0.7; }
          50% { transform: translate(${side === 'left' ? '30px' : '-30px'}, 50vh) scale(0.9); opacity: 0.8; }
          75% { transform: translate(${side === 'left' ? '-25px' : '25px'}, 75vh) scale(0.8); opacity: 0.7; }
          90% { transform: translate(${side === 'left' ? '20px' : '-20px'}, 90vh) scale(0.75); opacity: 0.6; }
          100% { transform: translate(0, 110vh) scale(0.7); opacity: 0; }
        }
        @keyframes ghostFloat2 {
          0% { transform: translate(0, -100px) scale(0.9); opacity: 0; }
          10% { transform: translate(${side === 'left' ? '15px' : '-15px'}, 10vh) scale(0.95); opacity: 0.8; }
          25% { transform: translate(${side === 'left' ? '-10px' : '10px'}, 25vh) scale(1); opacity: 0.9; }
          50% { transform: translate(${side === 'left' ? '20px' : '-20px'}, 50vh) scale(1.1); opacity: 1; }
          75% { transform: translate(${side === 'left' ? '-15px' : '15px'}, 75vh) scale(1); opacity: 0.9; }
          90% { transform: translate(${side === 'left' ? '10px' : '-10px'}, 90vh) scale(0.95); opacity: 0.8; }
          100% { transform: translate(0, 110vh) scale(0.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const Spider: React.FC<SpiderProps> = ({ index }) => {
  const left = 10 + (index % 8) * 10;
  const delay = index * 1;
  const speed = 12 + index % 6;
  
  return (
    <div 
      className="absolute"
      style={{ 
        left: `${left}vw`,
        top: 0,
        animation: `spiderDrop${index % 3} ${speed}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <div className="w-1 bg-gray-600" style={{ height: `${20 + index * 5}px` }}></div>
      <div className="transform -translate-x-1/2">
        <SpiderSVG />
      </div>
      <style>{`
        @keyframes spiderDrop0 {
          0% { transform: translateY(-50px); }
          20% { transform: translateY(30vh); }
          30% { transform: translateY(25vh); }
          40% { transform: translateY(30vh); }
          60% { transform: translateY(30vh); }
          80% { transform: translateY(0); }
          100% { transform: translateY(-50px); }
        }
        @keyframes spiderDrop1 {
          0% { transform: translateY(-50px); }
          20% { transform: translateY(15vh); }
          25% { transform: translateY(12vh); }
          30% { transform: translateY(15vh); }
          70% { transform: translateY(15vh); }
          90% { transform: translateY(0); }
          100% { transform: translateY(-50px); }
        }
        @keyframes spiderDrop2 {
          0% { transform: translateY(-50px); }
          20% { transform: translateY(40vh); }
          30% { transform: translateY(35vh); }
          40% { transform: translateY(40vh); }
          50% { transform: translateY(38vh); }
          60% { transform: translateY(40vh); }
          80% { transform: translateY(0); }
          100% { transform: translateY(-50px); }
        }
      `}</style>
    </div>
  );
};

const HalloweenEffect: React.FC = () => {
  const [showFogEffect, setShowFogEffect] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    bats: 5,
    pumpkins: 7,
    ghosts: 3,
    spiders: 4,
    stars: 15,
    fogLevel: 3
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFogEffect(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const updateSetting = (setting: keyof Settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: parseInt(value)
    }));
  };

  const stars = Array.from({ length: settings.stars }).map((_, i) => ({
    top: Math.random() * 60,
    left: Math.random() * 100
  }));

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Fond de ciel sombre */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-indigo-900 to-purple-900"></div> */}
      
      {/* Étoiles */}
      {stars.map((star, i) => (
        <Star key={`star-${i}`} top={star.top} left={star.left} />
      ))}
      
      {/* Lune */}
      <Moon />
      
      {/* Effet de brouillard */}
      {showFogEffect && (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gray-600 opacity-20 blur-xl"></div>
          <div 
            className="absolute left-0 right-0 h-64" 
            style={{
              bottom: `-20px`,
              background: `repeating-linear-gradient(0deg, transparent, rgba(255,255,255,0.05) 2px, transparent 3px)`,
              opacity: settings.fogLevel * 0.1,
              animation: `fogRoll 60s linear infinite`
            }}
          >
            <style>{`
              @keyframes fogRoll {
                0% { background-position: 0 0; }
                100% { background-position: 100vw 0; }
              }
            `}</style>
          </div>
        </>
      )}
      
      {/* Chauve-souris */}
      {Array.from({ length: settings.bats }).map((_, i) => (
        <Bat key={`bat-${i}`} index={i} />
      ))}
      
      {/* Citrouilles */}
      {Array.from({ length: settings.pumpkins }).map((_, i) => (
        <Pumpkin key={`pumpkin-${i}`} index={i} />
      ))}
      
      {/* Fantômes */}
      {Array.from({ length: settings.ghosts }).map((_, i) => (
        <Ghost key={`ghost-${i}`} index={i} />
      ))}
      
      {/* Araignées */}
      {Array.from({ length: settings.spiders }).map((_, i) => (
        <Spider key={`spider-${i}`} index={i} />
      ))}
      
      {/* Bouton de paramètres */}
      <div className="absolute bottom-4 right-4 z-50 pointer-events-auto">
        <button 
          onClick={toggleSettings}
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-full p-2 shadow-lg"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="white"/>
            <path d="M19.4 15C19.2 15.4 19.2 15.8 19.4 16.2L21.1 18.9C21.3 19.3 21.2 19.8 20.9 20.1L18.9 22.1C18.6 22.4 18.1 22.5 17.7 22.3L15 20.6C14.6 20.4 14.2 20.4 13.8 20.6L11.1 22.3C10.7 22.5 10.2 22.4 9.9 22.1L7.9 20.1C7.6 19.8 7.5 19.3 7.7 18.9L9.4 16.2C9.6 15.8 9.6 15.4 9.4 15L7.7 12.3C7.5 11.9 7.6 11.4 7.9 11.1L9.9 9.1C10.2 8.8 10.7 8.7 11.1 8.9L13.8 10.6C14.2 10.8 14.6 10.8 15 10.6L17.7 8.9C18.1 8.7 18.6 8.8 18.9 9.1L20.9 11.1C21.2 11.4 21.3 11.9 21.1 12.3L19.4 15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      {/* Panneau de paramètres */}
      {showSettings && (
        <div className="absolute bottom-16 right-4 bg-gray-800 bg-opacity-90 p-4 rounded-lg shadow-lg z-50 text-white pointer-events-auto">
          <h3 className="text-xl font-bold mb-3 text-orange-400">Paramètres Halloween</h3>
          
          <div className="mb-2">
            <label className="flex items-center justify-between">
              <span>Chauves-souris: {settings.bats}</span>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={settings.bats}
                onChange={(e) => updateSetting('bats', e.target.value)}
                className="ml-2"
              />
            </label>
          </div>
          
          <div className="mb-2">
            <label className="flex items-center justify-between">
              <span>Citrouilles: {settings.pumpkins}</span>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={settings.pumpkins}
                onChange={(e) => updateSetting('pumpkins', e.target.value)}
                className="ml-2"
              />
            </label>
          </div>
          
          <div className="mb-2">
            <label className="flex items-center justify-between">
              <span>Fantômes: {settings.ghosts}</span>
              <input 
                type="range" 
                min="0" 
                max="6" 
                value={settings.ghosts}
                onChange={(e) => updateSetting('ghosts', e.target.value)}
                className="ml-2"
              />
            </label>
          </div>
          
          <div className="mb-2">
            <label className="flex items-center justify-between">
              <span>Araignées: {settings.spiders}</span>
              <input 
                type="range" 
                min="0" 
                max="6" 
                value={settings.spiders}
                onChange={(e) => updateSetting('spiders', e.target.value)}
                className="ml-2"
              />
            </label>
          </div>
          
          <div className="mb-2">
            <label className="flex items-center justify-between">
              <span>Brouillard: {settings.fogLevel}</span>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={settings.fogLevel}
                onChange={(e) => updateSetting('fogLevel', e.target.value)}
                className="ml-2"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalloweenEffect;