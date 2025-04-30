import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Composant qui réinitialise la position de défilement à chaque changement de route
 * Ce composant doit être placé à l'intérieur du BrowserRouter dans App.tsx
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Remonte la page en haut à chaque changement de route
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Ce composant ne rend rien visuellement
};

export default ScrollToTop;